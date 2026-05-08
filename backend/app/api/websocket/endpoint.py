import json
import logging

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.api.websocket import connection_manager
from app.core.security import verify_token
from app.models.command import CommandRequest, CommandType
from app.services.drone_registry import drone_registry

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT Bearer 토큰"),
) -> None:
    # 먼저 accept 후 검증 → 클라이언트가 4001을 정확히 수신
    await websocket.accept()
    user = verify_token(token)
    if user is None:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await connection_manager.connect(websocket, already_accepted=True)
    logger.info("사용자 '%s' WebSocket 연결", user)

    # 현재 연결된 드론 스냅샷 전송
    snapshot = [s.model_dump(mode="json") for s in drone_registry.get_all()]
    await connection_manager.send_personal(
        websocket, {"type": "snapshot", "data": snapshot}
    )

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                continue

            if msg.get("type") == "command":
                drone_id: str = msg.get("drone_id", "")
                cmd_str: str = msg.get("command", "")
                params: dict = msg.get("params", {})
                try:
                    cmd = CommandType(cmd_str)
                    logger.info("명령 수신 [%s] → %s %s", user, drone_id, cmd)
                    # TODO: Phase 4 - 실제 드론 명령 전달
                    await connection_manager.send_personal(
                        websocket,
                        {
                            "type": "command_ack",
                            "drone_id": drone_id,
                            "command": cmd,
                            "status": "accepted",
                        },
                    )
                except ValueError:
                    logger.warning("알 수 없는 명령: %s", cmd_str)

    except WebSocketDisconnect:
        connection_manager.disconnect(websocket)
        logger.info("사용자 '%s' WebSocket 연결 해제", user)
