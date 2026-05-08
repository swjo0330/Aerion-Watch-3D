from enum import Enum

from pydantic import BaseModel


class CommandType(str, Enum):
    RTH = "RTH"
    PAUSE = "PAUSE"
    RESUME = "RESUME"
    SET_ALTITUDE_LIMIT = "SET_ALTITUDE_LIMIT"


class CommandRequest(BaseModel):
    command: CommandType
    params: dict = {}


class CommandAck(BaseModel):
    drone_id: str
    command: CommandType
    status: str  # accepted | rejected | timeout
    message: str = ""
