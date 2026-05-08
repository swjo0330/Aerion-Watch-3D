from fastapi import APIRouter

from app.api.endpoints import auth, commands, drones, health
from app.api.websocket.endpoint import router as ws_router

router = APIRouter()
router.include_router(health.router, tags=["health"])
router.include_router(auth.router, tags=["auth"])
router.include_router(drones.router, tags=["drones"])
router.include_router(commands.router, tags=["commands"])
router.include_router(ws_router, tags=["websocket"])
