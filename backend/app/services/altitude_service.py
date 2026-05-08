import logging

logger = logging.getLogger(__name__)


class AltitudeService:
    """이륙 지점 고도 기준값 저장 및 ATO 계산"""

    def __init__(self) -> None:
        self._takeoff_altitudes: dict[str, float] = {}

    def register_takeoff(self, drone_id: str, alt_msl: float) -> None:
        """이륙 지점 MSL 고도 등록 (최초 연결 또는 명시적 이륙 신호 시)"""
        self._takeoff_altitudes[drone_id] = alt_msl
        logger.info("드론 %s 이륙 고도 등록: %.1fm MSL", drone_id, alt_msl)

    def calculate_ato(self, drone_id: str, current_alt_msl: float) -> float:
        """현재 MSL 고도 - 이륙지점 MSL 고도 = ATO"""
        takeoff_alt = self._takeoff_altitudes.get(drone_id)
        if takeoff_alt is None:
            return 0.0
        return current_alt_msl - takeoff_alt

    def remove_drone(self, drone_id: str) -> None:
        self._takeoff_altitudes.pop(drone_id, None)

    def is_registered(self, drone_id: str) -> bool:
        return drone_id in self._takeoff_altitudes


altitude_service = AltitudeService()
