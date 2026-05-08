"use client";

import { useDroneStore } from "@/store/droneStore";
import type { DroneState } from "@/types/drone";

function batteryColor(pct: number) {
  if (pct > 60) return "text-green-400";
  if (pct > 30) return "text-yellow-400";
  return "text-red-400";
}

function altColor(alt: number) {
  if (alt <= 50) return "bg-green-500";
  if (alt <= 100) return "bg-yellow-500";
  return "bg-red-500";
}

function DroneRow({ drone, selected, onSelect }: {
  drone: DroneState;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`group relative w-full text-left px-4 py-3 rounded-xl transition-all duration-300 select-none outline-none ${
        selected 
          ? "bg-white/[0.08] shadow-[0px_5px_30px_0px_rgba(0,0,0,0.22)]" 
          : "hover:bg-white/[0.04]"
      }`}
    >
      {selected && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--apple-blue)] shadow-[0_1px_8px_rgba(0,113,227,0.5)]" />
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${altColor(drone.pos.alt_ato)} shadow-[0_0_5px_currentColor] transition-transform duration-300 ${selected ? "scale-110" : ""}`}
          />
          <span className="text-white apple-body font-medium truncate">
            {drone.drone_id}
          </span>
        </div>
        <span className={`apple-caption font-semibold flex-shrink-0 ${batteryColor(drone.status.battery)} px-2 py-0.5 bg-black/40 rounded-full border border-white/5 backdrop-blur-md`}>
          {drone.status.battery}%
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between apple-caption text-white/50 group-hover:text-white/70 transition-colors">
        <span>ATO {drone.pos.alt_ato.toFixed(0)}m</span>
        <span>{drone.status.speed_kmh.toFixed(0)} km/h</span>
        <span className="px-1.5 py-0.5 rounded px-2 bg-white/5 text-[11px]">{drone.status.gps_fix}</span>
      </div>
    </button>
  );
}

export default function DroneList({ onSelectDrone }: {
  onSelectDrone?: (droneId: string) => void;
}) {
  const { drones, selectedDroneId, selectDrone } = useDroneStore();
  const droneList = Object.values(drones);

  function handleSelect(id: string) {
    selectDrone(id === selectedDroneId ? null : id);
    onSelectDrone?.(id);
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="px-5 py-4 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between">
          <span className="apple-caption font-semibold text-[#86868b] uppercase tracking-wider">
            연결된 드론
          </span>
          <span className="apple-caption font-medium bg-apple-blue/20 text-apple-blue px-2.5 py-0.5 rounded-full">
            {droneList.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {droneList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 mt-10 opacity-50">
            <svg className="w-10 h-10 text-white mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <p className="apple-caption text-white text-center">드론 연결 대기 중...</p>
          </div>
        ) : (
          droneList.map((d) => (
            <DroneRow
              key={d.drone_id}
              drone={d}
              selected={d.drone_id === selectedDroneId}
              onSelect={() => handleSelect(d.drone_id)}
            />
          ))
        )}
      </div>

      <div className="px-5 py-4 border-t border-white/10 shrink-0 bg-black/20">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 apple-caption text-[#86868b] text-[11px]">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_currentColor]" /> 0–50m
          </div>
          <div className="flex items-center gap-1.5 apple-caption text-[#86868b] text-[11px]">
            <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_5px_currentColor]" /> 50–100m
          </div>
          <div className="flex items-center gap-1.5 apple-caption text-[#86868b] text-[11px]">
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_currentColor]" /> 100m+
          </div>
        </div>
      </div>
    </div>
  );
}
