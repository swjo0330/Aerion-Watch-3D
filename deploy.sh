#!/usr/bin/env bash
# SkyWatch-RT 배포 자동화 스크립트
# 사용법: ./deploy.sh [up|down|build|restart|logs|status]
set -euo pipefail

COMPOSE_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/docker-compose.yml"
PROJECT_NAME="skywatch-rt"

# .env 파일 존재 여부 확인
check_env() {
  local missing=0
  if [[ ! -f "backend/.env" ]]; then
    echo "[WARN] backend/.env 없음 → backend/.env.example 복사 후 값을 수정하세요."
    cp backend/.env.example backend/.env
    missing=1
  fi
  if [[ ! -f ".env" ]]; then
    echo "[WARN] .env 없음 → .env.example 복사"
    cp .env.example .env
    missing=1
  fi
  if [[ $missing -eq 1 ]]; then
    echo "[INFO] .env 파일이 생성되었습니다. JWT_SECRET_KEY 등 필수 값을 설정 후 다시 실행하세요."
    exit 1
  fi
}

cmd_build() {
  echo "=== [1/2] Docker 이미지 빌드 ==="
  docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build --no-cache
  echo "=== [2/2] 빌드 완료 ==="
}

cmd_up() {
  check_env
  echo "=== SkyWatch-RT 시작 ==="
  docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d
  echo ""
  echo "  Backend:  http://localhost:${BACKEND_PORT:-8000}"
  echo "  Frontend: http://localhost:${FRONTEND_PORT:-3000}"
  echo ""
  echo "로그 확인: ./deploy.sh logs"
}

cmd_down() {
  echo "=== SkyWatch-RT 종료 ==="
  docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down
}

cmd_restart() {
  cmd_down
  cmd_up
}

cmd_logs() {
  docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs -f --tail=100
}

cmd_status() {
  docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
}

cmd_rebuild_and_up() {
  check_env
  echo "=== 이미지 재빌드 후 시작 ==="
  docker compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" up -d --build
}

usage() {
  echo "사용법: $0 <command>"
  echo ""
  echo "Commands:"
  echo "  up        서비스 시작 (이미지 없으면 자동 빌드)"
  echo "  down      서비스 종료 및 컨테이너 제거"
  echo "  build     이미지 빌드 (캐시 무시)"
  echo "  deploy    이미지 재빌드 후 시작 (full deploy)"
  echo "  restart   종료 후 재시작"
  echo "  logs      실시간 로그 출력"
  echo "  status    컨테이너 상태 확인"
}

case "${1:-}" in
  up)       cmd_up ;;
  down)     cmd_down ;;
  build)    cmd_build ;;
  deploy)   cmd_rebuild_and_up ;;
  restart)  cmd_restart ;;
  logs)     cmd_logs ;;
  status)   cmd_status ;;
  *)        usage; exit 1 ;;
esac
