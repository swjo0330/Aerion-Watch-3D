from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.models.drone import DroneState
from app.services.drone_registry import drone_registry

router = APIRouter(prefix="/drones")


@router.get("", response_model=list[DroneState])
async def list_drones(_: str = Depends(get_current_user)) -> list[DroneState]:
    return drone_registry.get_all()


@router.get("/{drone_id}", response_model=DroneState)
async def get_drone(drone_id: str, _: str = Depends(get_current_user)) -> DroneState:
    state = drone_registry.get(drone_id)
    if state is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="드론을 찾을 수 없습니다")
    return state
