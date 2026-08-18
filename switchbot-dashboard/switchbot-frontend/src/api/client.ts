import type { HistoryResponse, MetersResponse, StatusResponse, TimeScale } from '../types';

/**
 * API のベースURL。空文字の場合は相対パス（同一オリジン配信）を使う。
 */
export const API_URL: string = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

function buildUrl(path: string): string {
  return `${API_URL}${path}`;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(buildUrl(path));
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

/** メーター一覧をキャッシュから取得する */
export function fetchMeters(): Promise<MetersResponse> {
  return getJson<MetersResponse>('/api/meters');
}

/** バックエンドの稼働状況・レート制限状態を取得する */
export function fetchStatus(): Promise<StatusResponse> {
  return getJson<StatusResponse>('/api/status');
}

/** 指定デバイスの履歴を時間スケール別に取得する */
export function fetchHistory(deviceId: string, timeScale: TimeScale): Promise<HistoryResponse> {
  return getJson<HistoryResponse>(
    `/api/meters/${encodeURIComponent(deviceId)}/history?time_scale=${timeScale}`,
  );
}

/** バックエンドに即時のデータ収集を要求する */
export async function triggerRefresh(): Promise<void> {
  const response = await fetch(buildUrl('/api/meters/refresh'), { method: 'POST' });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
}

/** データベースのバックアップを新規タブで開く */
export function openBackup(): void {
  window.open(buildUrl('/api/backup'), '_blank');
}
