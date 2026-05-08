from fastapi import APIRouter
from pydantic import BaseModel

from app.services.drone_registry import drone_registry

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    connected_drones: int


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok", connected_drones=drone_registry.count())
