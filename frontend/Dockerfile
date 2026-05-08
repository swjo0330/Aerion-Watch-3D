# ── Stage 1: 의존성 설치 ──────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts || npm install --ignore-scripts
RUN npm install lightningcss-linux-arm64-musl --no-save
RUN npm install cesium@1.95.0 --no-save

# ── Stage 2: 빌드 ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# deps 레이어에서 node_modules 복사
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 빌드 시점 환경 변수 (docker-compose build.args 또는 --build-arg 으로 주입)
# NEXT_PUBLIC_*: 브라우저에 노출 (클라이언트 번들에 포함)
ARG NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
ARG NEXT_PUBLIC_CESIUM_ION_TOKEN=""
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_CESIUM_ION_TOKEN=$NEXT_PUBLIC_CESIUM_ION_TOKEN
# BACKEND_INTERNAL_URL: Next.js 서버→백엔드 프록시 URL (rewrites에 빌드 타임 고정)
ARG BACKEND_INTERNAL_URL=http://localhost:8000
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL

# prebuild: Cesium 정적 파일 복사 + Next.js 빌드
RUN npm run build

# ── Stage 3: 런타임 이미지 ────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# 필요한 파일만 복사 (standalone 출력 없이 일반 빌드)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/ > /dev/null || exit 1

CMD ["node_modules/.bin/next", "start"]
