#!/usr/bin/env bash
# 로컬 개발 서버 시작/종료 스크립트
# 사용법: ./dev.sh [start|stop|restart]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$ROOT/.pids"
mkdir -p "$PID_DIR"

BACKEND_PID="$PID_DIR/backend.pid"
FRONTEND_PID="$PID_DIR/frontend.pid"
BACKEND_LOG="$PID_DIR/backend.log"
FRONTEND_LOG="$PID_DIR/frontend.log"

stop_service() {
  local name=$1
  local pidfile=$2
  if [[ -f "$pidfile" ]]; then
    local pid
    pid=$(cat "$pidfile")
    if kill -0 "$pid" 2>/dev/null; then
      kill "$pid"
      echo "  [$name] 종료 (PID $pid)"
    fi
    rm -f "$pidfile"
  fi
}

cmd_stop() {
  echo "=== 로컬 서버 종료 ==="
  stop_service "backend"  "$BACKEND_PID"
  stop_service "frontend" "$FRONTEND_PID"
}

cmd_start() {
  echo "=== 로컬 서버 시작 ==="

  # 백엔드
  cd "$ROOT/backend"
  uv run skywatch-backend > "$BACKEND_LOG" 2>&1 &
  echo $! > "$BACKEND_PID"
  echo "  [backend]  시작 (PID $(cat "$BACKEND_PID")) — http://localhost:8000"

  # 프론트엔드
  cd "$ROOT/frontend"
  npm run dev > "$FRONTEND_LOG" 2>&1 &
  echo $! > "$FRONTEND_PID"
  echo "  [frontend] 시작 (PID $(cat "$FRONTEND_PID")) — http://localhost:3000"

  echo ""
  echo "로그 확인:"
  echo "  tail -f $BACKEND_LOG"
  echo "  tail -f $FRONTEND_LOG"
  echo ""
  echo "종료: ./dev.sh stop"
}

case "${1:-start}" in
  start)   cmd_start ;;
  stop)    cmd_stop ;;
  restart) cmd_stop; sleep 1; cmd_start ;;
  *)       echo "사용법: $0 [start|stop|restart]"; exit 1 ;;
esac
