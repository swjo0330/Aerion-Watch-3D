from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class GPSFix(str, Enum):
    NO_FIX = "NO_FIX"
    GPS_2D = "2D"
    GPS_3D = "3D"
    DGPS = "DGPS"
    RTK = "RTK"


class SensorHealth(str, Enum):
    OK = "OK"
    WARNING = "WARNING"
    ERROR = "ERROR"


class DronePosition(BaseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    alt_msl: float = Field(ge=-500, le=50000, description="MSL 고도 (미터)")
    alt_ato: float = Field(ge=-100, le=50000, description="이륙지점 기준 고도 (미터)")


class DroneRotation(BaseModel):
    yaw: float = Field(ge=0, lt=360, description="방위각 (도)")
    pitch: float = Field(ge=-90, le=90, description="피치 (도)")
    roll: float = Field(ge=-180, le=180, description="롤 (도)")


class DroneStatus(BaseModel):
    battery: int = Field(ge=0, le=100, description="배터리 잔량 (%)")
    gps_fix: GPSFix
    speed_kmh: float = Field(ge=0, description="속도 (km/h)")
    sensor_health: SensorHealth


class DroneState(BaseModel):
    model_config = ConfigDict(frozen=True)

    drone_id: str
    timestamp: datetime
    pos: DronePosition
    rot: DroneRotation
    trace: bool = True
    status: DroneStatus
