# Build and run backend (serves frontend static files)
FROM python:3.12-slim
WORKDIR /app

# Install poetry
RUN pip install --no-cache-dir poetry==1.8.5

# Copy and install backend dependencies
COPY switchbot-backend/pyproject.toml switchbot-backend/poetry.lock ./
RUN poetry config virtualenvs.create false && \
    poetry install --only main --no-root --no-interaction --no-ansi

# Copy backend application code
COPY switchbot-backend/app/ ./app/

# Copy frontend to root: served at /
COPY switchbot-frontend/ ./static/

RUN useradd --uid 10001 --create-home appuser && \
    mkdir -p /data && chown appuser:appuser /data
USER appuser

EXPOSE 8000

CMD ["fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8000"]
