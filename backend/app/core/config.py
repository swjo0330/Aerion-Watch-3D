from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # JWT
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000", "https://localhost"]

    # WebSocket
    WS_MAX_CONNECTIONS: int = 50
    RATE_LIMIT_PER_SECOND: int = 100

    # MAVLink
    MAVLINK_UDP_PORT: int = 14550

    # Cesium
    CESIUM_ION_TOKEN: str = ""

    # Redis (Phase 5 확장성 대비)
    REDIS_URL: str = "redis://redis:6379"


settings = Settings()
