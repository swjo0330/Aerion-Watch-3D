# ── Stage 1: 의존성 설치 (uv 사용) ────────────────────────────────────────
FROM python:3.12-slim AS builder

# uv 바이너리 복사
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# pyproject.toml + uv.lock + README.md 먼저 복사 (레이어 캐시 활용)
# README.md는 hatchling 빌드에 필요
COPY pyproject.toml uv.lock README.md ./

# 프로덕션 의존성만 설치 (dev 제외), .venv 생성
RUN uv sync --frozen --no-dev

# ── Stage 2: 런타임 이미지 ─────────────────────────────────────────────────
FROM python:3.12-slim AS runner

WORKDIR /app

# uv 바이너리 복사 (런타임에도 사용)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/

# builder에서 venv 복사
COPY --from=builder /app/.venv ./.venv

# 소스 복사
COPY app/ ./app/
COPY main.py ./

# .venv를 PATH에 추가
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH="/app"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
