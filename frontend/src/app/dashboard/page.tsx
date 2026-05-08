"use client";

import { useDroneStore } from "@/store/droneStore";
import MapLayerToggle from "@/components/MapLayerToggle";
import type { CommandType } from "@/types/drone";

export default function SwarmOverviewPage() {
  const { drones, selectedDroneId, selectDrone, sendCommand } = useDroneStore();
  const droneValues = Object.values(drones);
  const activeCount = droneValues.length;

  return (
    <div className="relative z-10 flex flex-1 p-6 gap-6 justify-between select-none">
      {/* ── LEFT PANEL: Agent Logic & Summary ── */}
      <section className="w-80 flex flex-col gap-4 pointer-events-auto h-full">
        {/* Agent Reasoning Log */}
        <div className="glass-panel bg-neutral-950/60 border border-white/10 rounded-[1rem] flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-orange-500 text-sm">psychology</span>
              <h2 className="text-[11px] font-bold tracking-widest uppercase">Agent Reasoning Log</h2>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--tertiary)] animate-pulse"></div>
            </div>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto text-[11px] leading-relaxed font-mono">
            <div className="space-y-1">
              <p className="text-neutral-500">14:20:01.42</p>
              <p className="text-white">Evaluating mission constraints for Area 7...</p>
            </div>
            <div className="space-y-1">
              <p className="text-neutral-500">14:20:02.89</p>
              <p className="text-orange-400">Safety-Validator: Wind speeds at 24kts. Recalculating drag vectors.</p>
            </div>
            <div className="space-y-1">
              <p className="text-neutral-500">14:20:05.11</p>
              <p className="text-[var(--tertiary)]">NATS Mesh: Latency optimized across active nodes.</p>
            </div>
          </div>
        </div>

        {/* Small Telemetry Card */}
        <div className="glass-panel bg-neutral-950/60 border border-white/10 rounded-[1rem] p-4 shrink-0">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] text-neutral-500 font-bold tracking-wider uppercase">Active Nodes</p>
              <p className="text-4xl font-black text-white -mt-1 tracking-tighter">
                {activeCount}<span className="text-sm text-neutral-600"> / {activeCount}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-neutral-500 font-bold tracking-wider uppercase">Avg. Battery</p>
              <p className="text-2xl font-bold text-[var(--tertiary)]">
                {activeCount > 0 ? Math.round(droneValues.reduce((sum, d) => sum + d.status.battery, 0) / activeCount) : 0}%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CENTER: Map Tools & Layer Toggle ── */}
      <div className="flex-1 flex flex-col justify-end items-center pb-8 pointer-events-auto">
        <MapLayerToggle />
      </div>

      {/* ── RIGHT PANEL: Hierarchical Monitor & Swarm Health ── */}
      <section className="w-96 flex flex-col gap-6 pointer-events-auto h-full">
        {/* Swarm Health Matrix */}
        <div className="glass-panel bg-neutral-950/60 border border-white/10 rounded-[1rem] flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--tertiary)] text-sm">health_and_safety</span>
            <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Swarm Health Matrix</p>
          </div>
          <div className="divide-y divide-white/5 overflow-y-auto flex-1">
            {activeCount === 0 ? (
               <div className="p-6 opacity-50 flex flex-col items-center">
                 <span className="material-symbols-outlined text-4xl mb-2">signal_disconnected</span>
                 <p className="text-xs uppercase tracking-widest">Waiting for Sync</p>
               </div>
            ) : droneValues.map(d => {
              const isSelected = selectedDroneId === d.drone_id;
              return (
                <div 
                  key={d.drone_id} 
                  onClick={() => selectDrone(isSelected ? null : d.drone_id)}
                  className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${isSelected ? "bg-[var(--primary-container)]/20" : "hover:bg-white/5"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-6 rounded-full ${isSelected ? "bg-[var(--primary)]" : "bg-[var(--tertiary)]"}`}></div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? "text-[var(--primary)]" : "text-white"}`}>
                        {d.drone_id}
                      </p>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        ALT: {d.pos.alt_ato.toFixed(0)}m | SPD: {d.status.speed_kmh.toFixed(0)}km/h
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold py-0.5 px-2 bg-black/40 rounded border border-white/10">{d.status.battery}%</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Bottom Formation Control */}
        <div className="glass-panel bg-neutral-950/70 border border-white/10 rounded-[1rem] p-4 shrink-0">
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Emergency Protocols</h3>
          <div className="flex gap-2">
             <button 
                onClick={() => sendCommand("ALL", "RTL")}
                className="flex-1 py-3 bg-[var(--error)]/20 hover:bg-[var(--error)]/30 text-[var(--error)] border border-[var(--error)]/50 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">emergency_home</span>
                FORCE RTL
             </button>
             <button className="flex-1 py-3 bg-[var(--primary-container)] text-[var(--on-primary-container)] border border-[var(--primary-container)] rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(255,92,0,0.4)]">
                <span className="material-symbols-outlined text-sm">grid_3x3</span>
                GRID ATK
             </button>
          </div>
        </div>
      </section>
    </div>
  );
}
