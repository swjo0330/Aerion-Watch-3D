"use client";

import MapLayerToggle from "@/components/MapLayerToggle";
import { useMissionStore } from "@/store/missionStore";

export default function MissionPlannerPage() {
  const { 
    waypoints, 
    activeWaypointId, 
    setActiveWaypoint, 
    removeWaypoint, 
    updateWaypoint,
    clearMission,
  } = useMissionStore();

  return (
    <div className="relative z-10 flex flex-1 p-6 justify-between select-none pointer-events-none">
      
      {/* ── LEFT SIDEBAR: Mission Catalog & Waypoints ── */}
      <aside className="w-80 flex flex-col space-y-4 pointer-events-auto h-[calc(100vh-10rem)] overflow-hidden">
        <div className="bg-[var(--surface-container-high)]/80 backdrop-blur-xl rounded-[1rem] p-4 border border-white/5 shadow-2xl shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-black tracking-widest uppercase text-[var(--on-surface-variant)]">Mission Catalog</h2>
            <span className="px-2 py-0.5 bg-[var(--primary-container)] text-[var(--on-primary-container)] text-[10px] font-bold rounded">LIVE</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-[var(--surface-bright)]/20 p-2 rounded-lg border-l-2 border-[var(--primary-container)] cursor-pointer">
              <span className="text-sm font-medium text-white">Custom_Route</span>
              <span className="material-symbols-outlined text-[var(--primary)] text-sm">check_circle</span>
            </div>
          </div>
        </div>
        
        {/* Waypoint List */}
        <div className="flex-1 bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 border border-white/5 shadow-2xl flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xs font-black tracking-widest uppercase text-[var(--on-surface-variant)]">Waypoint Config</h2>
             {waypoints.length > 0 && (
                <button onClick={clearMission} className="text-[10px] text-[var(--error)] bg-[var(--error-container)]/10 px-2 py-1 rounded hover:bg-[var(--error-container)]/30 transition-colors">
                  CLEAR
                </button>
             )}
          </div>
          
          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            {waypoints.length === 0 ? (
               <div className="text-center py-10 opacity-50">
                  <span className="material-symbols-outlined text-3xl mb-2 text-white">touch_app</span>
                  <p className="text-[10px] uppercase tracking-widest">Click Map to Add Waypoint</p>
               </div>
            ) : waypoints.map(wp => {
              const isActive = wp.id === activeWaypointId;
              
              if (isActive) {
                // Active State Reference
                return (
                  <div key={wp.id} className="bg-[var(--surface-container-highest)] rounded-xl p-3 border border-[var(--primary-container)]/40 shadow-[0_0_15px_rgba(255,92,0,0.15)] ring-1 ring-[var(--primary-container)]">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-[var(--primary)]">{wp.id}</span>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] text-[var(--primary)] animate-pulse">SELECTED</span>
                         <span onClick={() => removeWaypoint(wp.id)} className="material-symbols-outlined text-xs text-[var(--error)] cursor-pointer hover:scale-110">delete</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-widest text-[var(--on-surface-variant)]">Altitude (m)</label>
                        <input 
                          className="w-full bg-black/40 border-b border-[var(--primary-container)] text-[var(--primary)] font-bold text-sm focus:outline-none py-1" 
                          type="number" 
                          value={wp.alt}
                          onChange={(e) => updateWaypoint(wp.id, { alt: Number(e.target.value) })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-widest text-[var(--on-surface-variant)]">Latitude</label>
                          <div className="text-[10px] font-mono text-white">{wp.lat.toFixed(5)}°</div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-widest text-[var(--on-surface-variant)]">Longitude</label>
                          <div className="text-[10px] font-mono text-white">{wp.lng.toFixed(5)}°</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Inactive State Reference
              return (
                <div key={wp.id} onClick={() => setActiveWaypoint(wp.id)} className="bg-[var(--surface-container-high)] rounded-xl p-3 border border-white/5 opacity-60 cursor-pointer hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-[var(--on-surface-variant)]">{wp.id}</span>
                    <span className="text-[10px] text-[var(--on-surface-variant)]/50">{wp.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-white">
                    <div>ALT: {wp.alt}m</div>
                    <div>SPD: {wp.spd}m/s</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ── RIGHT SIDEBAR: Analysis & Telemetry Prediction ── */}
      <aside className="w-80 flex flex-col space-y-4 pointer-events-auto h-[calc(100vh-10rem)]">
        {/* Summary Card */}
        <div className="bg-[var(--surface-container-high)]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/5 shadow-2xl shrink-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-black tracking-widest uppercase text-[var(--on-surface-variant)]">Mission Analysis</h2>
            <MapLayerToggle />
          </div>
          <div className="space-y-6">
            {/* Metric 1 */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] text-[var(--on-surface-variant)] font-bold">TOTAL DISTANCE</span>
                <span className="text-lg font-black tracking-tighter text-white">14.8 <span className="text-xs font-normal opacity-60">km</span></span>
              </div>
              <div className="h-[1px] w-full bg-white/5"></div>
            </div>
            {/* Metric 2 */}
            <div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] text-[var(--on-surface-variant)] font-bold">ESTIMATED TIME</span>
                <span className="text-lg font-black tracking-tighter text-white">24:45 <span className="text-xs font-normal opacity-60">min</span></span>
              </div>
              <div className="h-[1px] w-full bg-white/5"></div>
            </div>
            {/* Metric 3 with Chart */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] text-[var(--on-surface-variant)] font-bold">BATTERY CONSUMPTION</span>
                <span className="text-lg font-black tracking-tighter text-[var(--primary)]">68 <span className="text-xs font-normal opacity-60 text-white">%</span></span>
              </div>
              <div className="h-12 w-full flex items-end space-x-1 mb-2">
                <div className="w-full h-4 bg-[var(--primary-container)]/20 rounded-sm"></div>
                <div className="w-full h-6 bg-[var(--primary-container)]/20 rounded-sm"></div>
                <div className="w-full h-8 bg-[var(--primary-container)]/40 rounded-sm"></div>
                <div className="w-full h-10 bg-[var(--primary-container)]/60 rounded-sm"></div>
                <div className="w-full h-12 bg-[var(--primary-container)]/80 rounded-sm"></div>
                <div className="w-full h-9 bg-[var(--primary-container)]/50 rounded-sm"></div>
                <div className="w-full h-6 bg-[var(--primary-container)]/30 rounded-sm"></div>
              </div>
              <div className="w-full h-1.5 bg-[var(--surface-container-highest)] rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-[var(--primary-container)]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* UTM Status Panel */}
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl p-4 border border-white/5 shadow-2xl flex-1 overflow-y-auto">
          <h2 className="text-xs font-black tracking-widest uppercase text-[var(--on-surface-variant)] mb-4">Traffic Conflict Analysis</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-[var(--tertiary)]/10 rounded-lg border-l-2 border-[var(--tertiary)]">
              <span className="material-symbols-outlined text-[var(--tertiary)] text-sm">verified_user</span>
              <div className="text-[10px] text-white">No active trajectory conflicts detected in UTM sector G-14.</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── BOTTOM TIMELINE (CENTERED) ── */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-6 pointer-events-auto">
        <div className="bg-zinc-900/90 backdrop-blur-2xl rounded-full px-8 py-3 flex items-center space-x-6 border border-white/5 shadow-2xl shadow-black/60">
          <div className="flex items-center space-x-4">
            <button className="text-white/80 hover:text-[var(--primary)] transition-all flex items-center justify-center">
              <span className="material-symbols-outlined">skip_previous</span>
            </button>
            <button className="bg-[var(--primary-container)] text-[var(--on-primary-container)] rounded-full p-2 hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            </button>
            <button className="text-white/80 hover:text-[var(--primary)] transition-all flex items-center justify-center">
              <span className="material-symbols-outlined">skip_next</span>
            </button>
          </div>
          <div className="w-64 h-1 bg-[var(--surface-container-high)] rounded-full relative cursor-pointer group">
            <div className="absolute inset-y-0 left-0 w-1/3 bg-[var(--primary-container)] rounded-full"></div>
            <div className="absolute top-1/2 left-1/3 -translate-y-1/2 h-3 w-3 bg-white rounded-full shadow-lg border-2 border-[var(--primary-container)] group-hover:scale-125 transition-transform"></div>
          </div>
          <div className="text-[10px] font-mono text-white/50 tracking-widest">
            08:14 / 24:45
          </div>
        </div>
      </div>

      {/* ── CTA (BOTTOM RIGHT) ── */}
      <button className="fixed bottom-8 right-8 z-50 bg-[var(--primary-container)] text-[var(--on-primary-container)] hover:bg-[var(--primary-container)]/90 px-8 py-4 rounded-[1rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-orange-500/20 flex items-center space-x-3 transition-all hover:scale-105 active:scale-95 pointer-events-auto">
        <span>Upload Mission</span>
        <span className="material-symbols-outlined">rocket_launch</span>
      </button>

    </div>
  );
}
