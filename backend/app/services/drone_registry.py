import logging
from datetime import datetime, timezone

from app.models.drone import DroneState

logger = logging.getLogger(__name__)


class DroneRegistry:
    """인메모리 드론 상태 레지스트리"""

    def __init__(self) -> None:
        self._drones: dict[str, DroneState] = {}

    def update(self, state: DroneState) -> None:
        self._drones[state.drone_id] = state

    def get(self, drone_id: str) -> DroneState | None:
        return self._drones.get(drone_id)

    def get_all(self) -> list[DroneState]:
        return list(self._drones.values())

    def remove(self, drone_id: str) -> None:
        self._drones.pop(drone_id, None)
        logger.info("드론 %s 레지스트리에서 제거", drone_id)

    def count(self) -> int:
        return len(self._drones)

    def is_connected(self, drone_id: str) -> bool:
        return drone_id in self._drones


drone_registry = DroneRegistry()
