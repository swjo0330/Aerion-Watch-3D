export type GPSFix = "NO_FIX" | "2D" | "3D" | "DGPS" | "RTK";
export type SensorHealth = "OK" | "WARNING" | "ERROR";
export type CommandType = "RTH" | "PAUSE" | "RESUME" | "SET_ALTITUDE_LIMIT";

export interface DronePosition {
  lat: number;
  lng: number;
  alt_msl: number;
  alt_ato: number;
}

export interface DroneRotation {
  yaw: number;
  pitch: number;
  roll: number;
}

export interface DroneStatus {
  battery: number;
  gps_fix: GPSFix;
  speed_kmh: number;
  sensor_health: SensorHealth;
}

export interface DroneState {
  drone_id: string;
  timestamp: string;
  pos: DronePosition;
  rot: DroneRotation;
  trace: boolean;
  status: DroneStatus;
}

export interface TracePoint {
  lng: number;
  lat: number;
  alt: number;
  ts: number;
}

export type WsMessage =
  | { type: "snapshot"; data: DroneState[] }
  | { type: "drone_update"; data: DroneState }
  | { type: "batch_update"; data: DroneState[] }
  | { type: "drone_remove"; data: { drone_id: string } }
  | { type: "command_ack"; drone_id: string; command: string; status: string };
