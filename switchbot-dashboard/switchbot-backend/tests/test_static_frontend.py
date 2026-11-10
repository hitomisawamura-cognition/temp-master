from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

import app.main as main_module
from app.main import ASSET_CACHE_CONTROL, INDEX_CACHE_CONTROL, register_spa_routes, resolve_static_dir


@pytest.fixture
def dist_dir(tmp_path: Path) -> Path:
    dist = tmp_path / "dist"
    (dist / "assets").mkdir(parents=True)
    (dist / "index.html").write_text("<!doctype html><div id=root></div>")
    (dist / "assets" / "index-abc123.js").write_text("console.log('app')")
    (dist / "favicon.svg").write_text("<svg/>")
    (tmp_path / "secret.txt").write_text("outside")
    return dist


@pytest.fixture
def spa_client(dist_dir: Path) -> TestClient:
    spa = FastAPI()

    @spa.get("/api/meters")
    async def meters():
        return {"meters": []}

    register_spa_routes(spa, dist_dir)
    return TestClient(spa)


class TestResolveStaticDir:
    def test_env_var_takes_precedence(self, dist_dir: Path, monkeypatch):
        monkeypatch.setenv("STATIC_DIR", str(dist_dir))
        assert resolve_static_dir() == dist_dir.resolve()

    def test_ignores_dirs_without_index_html(self, tmp_path: Path, monkeypatch):
        monkeypatch.setenv("STATIC_DIR", str(tmp_path))
        monkeypatch.setattr(main_module, "BACKEND_ROOT", tmp_path / "backend")
        assert resolve_static_dir() is None

    def test_falls_back_to_frontend_dist(self, tmp_path: Path, monkeypatch):
        dist = tmp_path / "switchbot-frontend" / "dist"
        dist.mkdir(parents=True)
        (dist / "index.html").write_text("ok")
        monkeypatch.delenv("STATIC_DIR", raising=False)
        monkeypatch.setattr(main_module, "BACKEND_ROOT", tmp_path / "switchbot-backend")
        assert resolve_static_dir() == dist.resolve()


class TestServeSpa:
    def test_root_serves_index_without_cache(self, spa_client: TestClient):
        response = spa_client.get("/")
        assert response.status_code == 200
        assert 'id=root' in response.text
        assert response.headers["cache-control"] == INDEX_CACHE_CONTROL

    def test_hashed_assets_are_immutable(self, spa_client: TestClient):
        response = spa_client.get("/assets/index-abc123.js")
        assert response.status_code == 200
        assert response.headers["cache-control"] == ASSET_CACHE_CONTROL

    def test_other_files_are_served(self, spa_client: TestClient):
        response = spa_client.get("/favicon.svg")
        assert response.status_code == 200
        assert "cache-control" not in response.headers

    def test_unknown_paths_fall_back_to_index(self, spa_client: TestClient):
        response = spa_client.get("/some/client/route")
        assert response.status_code == 200
        assert 'id=root' in response.text

    def test_api_routes_still_win_and_unknown_api_is_404(self, spa_client: TestClient):
        assert spa_client.get("/api/meters").json() == {"meters": []}
        assert spa_client.get("/api/does-not-exist").status_code == 404

    def test_path_traversal_returns_index(self, spa_client: TestClient):
        response = spa_client.get("/..%2Fsecret.txt")
        assert response.status_code == 200
        assert "outside" not in response.text
