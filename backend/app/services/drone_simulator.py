import asyncio
import logging
import math
import random
from datetime import datetime, timezone

from app.api.websocket import connection_manager
from app.models.drone import (
    DronePosition,
    DroneRotation,
    DroneState,
    DroneStatus,
    GPSFix,
    SensorHealth,
)
from app.services.altitude_service import altitude_service
from app.services.drone_registry import drone_registry

logger = logging.getLogger(__name__)

_DRONE_COUNT = 300
_UPDATE_INTERVAL = 0.5  # 초


class _DroneData:
    def __init__(self, drone_id: str, lat: float, lng: float, alt_msl: float) -> None:
        self.drone_id = drone_id
        self.lat = lat
        self.lng = lng
        self.alt_msl = alt_msl
        self.yaw = random.uniform(0, 360)
        self.pitch = 0.0
        self.roll = 0.0
        self.speed_kmh = random.uniform(15, 30)
        self.battery = float(random.randint(75, 100))
        self.heading = random.uniform(0, 360)


class DroneSimulator:
    """가상 드론 데이터 생성기 - 서울 중심 반경 내 드론 시뮬레이션"""

    _BASE_LAT = 37.5665
    _BASE_LNG = 126.9780

    def __init__(self) -> None:
        self._running = False
        self._drones: list[_DroneData] = []
        self._task: asyncio.Task | None = None

    def _init_drones(self) -> None:
        self._drones.clear()
        for i in range(1, _DRONE_COUNT + 1):
            drone_id = f"DRN-{i:03d}"
            lat = self._BASE_LAT + random.uniform(-0.02, 0.02)
            lng = self._BASE_LNG + random.uniform(-0.02, 0.02)
            alt_msl = random.uniform(80, 180)
            takeoff_alt = alt_msl - random.uniform(20, 60)

            d = _DroneData(drone_id, lat, lng, alt_msl)
            self._drones.append(d)
            altitude_service.register_takeoff(drone_id, takeoff_alt)

    async def _update_loop(self) -> None:
        while self._running:
            try:
                now = datetime.now(timezone.utc)
                batch: list[dict] = []

                for d in self._drones:
                    # 시각적으로 빠르게 보이도록 speed_kmh를 20배 강조 (데모 시뮬레이션용)
                    heading_rad = math.radians(d.heading)
                    speed_ms = (d.speed_kmh * 20) / 3.6 * _UPDATE_INTERVAL
                    d.lat += speed_ms * math.cos(heading_rad) / 111320
                    d.lng += speed_ms * math.sin(heading_rad) / (
                        111320 * math.cos(math.radians(d.lat))
                    )
                    d.alt_msl += random.uniform(-2.5, 2.5)
                    d.alt_msl = max(50.0, min(300.0, d.alt_msl))
                    d.yaw = d.heading
                    d.pitch = random.uniform(-10, 10)
                    d.roll = random.uniform(-15, 15)
                    d.battery = max(0.0, d.battery - 0.02)
                    d.heading = (d.heading + random.uniform(-15, 15)) % 360

                    alt_ato = altitude_service.calculate_ato(d.drone_id, d.alt_msl)

                    state = DroneState(
                        drone_id=d.drone_id,
                        timestamp=now,
                        pos=DronePosition(
                            lat=round(d.lat, 7),
                            lng=round(d.lng, 7),
                            alt_msl=round(d.alt_msl, 2),
                            alt_ato=round(alt_ato, 2),
                        ),
                        rot=DroneRotation(
                            yaw=round(d.yaw % 360, 2) % 360,
                            pitch=round(max(-90, min(90, d.pitch)), 2),
                            roll=round(max(-180, min(180, d.roll)), 2),
                        ),
                        trace=True,
                        status=DroneStatus(
                            battery=int(d.battery),
                            gps_fix=GPSFix.RTK,
                            speed_kmh=round(d.speed_kmh, 1),
                            sensor_health=SensorHealth.OK,
                        ),
                    )
                    drone_registry.update(state)
                    batch.append(state.model_dump(mode="json"))

                # 300대를 개별 메시지 대신 배치 1개로 브로드캐스트
                await connection_manager.broadcast(
                    {"type": "batch_update", "data": batch}
                )

            except Exception as e:
                logger.error("드론 시뮬레이터 루프 오류: %s", e, exc_info=True)

            await asyncio.sleep(_UPDATE_INTERVAL)

    async def start(self) -> None:
        if self._running:
            return
        self._init_drones()
        self._running = True
        self._task = asyncio.create_task(self._update_loop())
        logger.info("드론 시뮬레이터 시작 (%d대)", _DRONE_COUNT)

    async def stop(self) -> None:
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("드론 시뮬레이터 종료")


drone_simulator = DroneSimulator()
