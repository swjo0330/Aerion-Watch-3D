from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.models.command import CommandAck, CommandRequest
from app.services.drone_registry import drone_registry

router = APIRouter(prefix="/drones")


@router.post("/{drone_id}/command", response_model=CommandAck)
async def send_command(
    drone_id: str,
    body: CommandRequest,
    _: str = Depends(get_current_user),
) -> CommandAck:
    if not drone_registry.is_connected(drone_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="드론이 연결되어 있지 않습니다")

    # WebSocket 연결 시 WS 핸들러를 통해 전송하는 것이 우선.
    # 이 엔드포인트는 REST fallback 용도.
    # Phase 2에서 ConnectionManager와 연동 예정.
    return CommandAck(
        drone_id=drone_id,
        command=body.command,
        status="accepted",
        message=f"{body.command} 명령 수신됨 (REST fallback)",
    )
