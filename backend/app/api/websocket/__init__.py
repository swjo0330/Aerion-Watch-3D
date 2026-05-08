import json
import logging
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """WebSocket 연결 관리자 - 모든 프론트엔드 클라이언트에게 브로드캐스트"""

    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket, already_accepted: bool = False) -> None:
        if not already_accepted:
            await websocket.accept()
        self._connections.add(websocket)
        logger.info("WebSocket 연결됨. 현재 연결 수: %d", len(self._connections))

    def disconnect(self, websocket: WebSocket) -> None:
        self._connections.discard(websocket)
        logger.info("WebSocket 연결 해제. 현재 연결 수: %d", len(self._connections))

    async def broadcast(self, message: dict[str, Any]) -> None:
        if not self._connections:
            return
        text = json.dumps(message, default=str)
        dead: set[WebSocket] = set()
        for ws in list(self._connections):
            try:
                await ws.send_text(text)
            except Exception:
                dead.add(ws)
        for ws in dead:
            self._connections.discard(ws)

    async def send_personal(self, websocket: WebSocket, message: dict[str, Any]) -> None:
        await websocket.send_text(json.dumps(message, default=str))

    def count(self) -> int:
        return len(self._connections)


connection_manager = ConnectionManager()
