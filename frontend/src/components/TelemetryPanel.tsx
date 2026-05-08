"use client";

import { useDroneStore } from "@/store/droneStore";
import type { CommandType } from "@/types/drone";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
      <span className="apple-caption text-[#86868b]">{label}</span>
      <span className="apple-body text-white text-[15px]">{value}</span>
    </div>
  );
}

function BatteryBar({ pct }: { pct: number }) {
  const color = pct > 60 ? "bg-green-500" : pct > 30 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="w-full bg-[#333336] rounded-full h-1 mt-1.5 overflow-hidden">
      <div className={`${color} h-1 rounded-full transition-all duration-500 shadow-[0_0_5px_currentColor]`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function TelemetryPanel({ onCommand }: {
  onCommand?: (droneId: string, cmd: CommandType) => void;
}) {
  const { drones, selectedDroneId, selectDrone } = useDroneStore();
  const drone = selectedDroneId ? drones[selectedDroneId] : null;

  if (!drone) return null;

  const p = drone.pos;
  const r = drone.rot;
  const s = drone.status;

  return (
    <div className="absolute top-6 right-6 z-10 w-72 bg-[#1d1d1f]/80 backdrop-blur-[20px] backdrop-saturate-[180%] rounded-[18px] shadow-apple text-white overflow-hidden border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <p className="apple-caption text-[#86868b] uppercase tracking-wider text-[11px] font-semibold mb-0.5">텔레메트리</p>
          <p className="apple-title text-xl">{drone.drone_id}</p>
        </div>
        <button
          onClick={() => selectDrone(null)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-[#86868b] hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Battery */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="apple-caption text-[#86868b]">배터리</span>
          <span className={`apple-body font-semibold ${s.battery > 60 ? "text-green-400" : s.battery > 30 ? "text-yellow-400" : "text-red-400"}`}>
            {s.battery}%
          </span>
        </div>
        <BatteryBar pct={s.battery} />
      </div>

      {/* Position */}
      <div className="px-5 pb-2">
        <p className="apple-caption text-[#86868b] uppercase tracking-wider text-[11px] font-semibold mb-1 mt-2">위치</p>
        <Row label="위도" value={`${p.lat.toFixed(6)}°`} />
        <Row label="경도" value={`${p.lng.toFixed(6)}°`} />
        <Row label="고도 MSL" value={`${p.alt_msl.toFixed(1)} m`} />
        <Row label="고도 ATO" value={`${p.alt_ato.toFixed(1)} m`} />
      </div>

      {/* Rotation */}
      <div className="px-5 pb-2">
        <p className="apple-caption text-[#86868b] uppercase tracking-wider text-[11px] font-semibold mb-1 mt-2">자세</p>
        <Row label="Yaw" value={`${r.yaw.toFixed(1)}°`} />
        <Row label="Pitch" value={`${r.pitch.toFixed(1)}°`} />
        <Row label="Roll" value={`${r.roll.toFixed(1)}°`} />
      </div>

      {/* Status */}
      <div className="px-5 pb-3 border-b border-white/5">
        <p className="apple-caption text-[#86868b] uppercase tracking-wider text-[11px] font-semibold mb-1 mt-2">상태</p>
        <Row label="속도" value={`${s.speed_kmh.toFixed(1)} km/h`} />
        <Row label="GPS Fix" value={s.gps_fix} />
        <Row
          label="센서 상태"
          value={s.sensor_health}
        />
      </div>

      {/* Commands */}
      {onCommand && (
        <div className="px-5 pb-5 pt-3">
          <p className="apple-caption text-[#86868b] uppercase tracking-wider text-[11px] font-semibold mb-3">제어 명령</p>
          <div className="flex gap-2">
            <button
              onClick={() => onCommand(drone.drone_id, "RTH")}
              className="flex-1 apple-caption font-medium bg-[#1d1d1f] hover:bg-[#2c2c2e] text-white rounded-full py-2.5 transition-colors shadow-sm"
            >
              RTH
            </button>
            <button
              onClick={() => onCommand(drone.drone_id, "PAUSE")}
              className="flex-1 apple-caption font-medium bg-[#1d1d1f] hover:bg-[#2c2c2e] text-white rounded-full py-2.5 transition-colors shadow-sm"
            >
              상태정지
            </button>
            <button
              onClick={() => onCommand(drone.drone_id, "RESUME")}
              className="flex-1 apple-caption font-medium bg-[var(--apple-blue)] hover:bg-[var(--apple-blue-hover)] text-white rounded-full py-2.5 transition-colors shadow-sm"
            >
              추적재개
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
