"use client";

import MapLayerToggle from "@/components/MapLayerToggle";

export default function AgenticReasoningPage() {
  return (
    <div className="relative z-10 flex flex-1 p-6 gap-6 justify-between select-none">
      {/* ── LEFT PANEL: Mission Directives ── */}
      <section className="w-80 flex flex-col gap-4 pointer-events-auto h-full">
        <div className="glass-panel bg-neutral-950/60 border border-white/10 rounded-[1rem] flex-1 flex flex-col overflow-hidden p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-black tracking-[0.2em] uppercase text-[var(--on-surface-variant)]">Mission Directives</h2>
            <span className="text-[10px] bg-[var(--tertiary-container)]/20 text-[var(--tertiary)] px-2 py-0.5 rounded-full border border-[var(--tertiary)]/30">
              ACTIVE
            </span>
          </div>
          
          <div className="flex-1 space-y-6 overflow-y-auto pr-2">
            <div className="relative pl-4 border-l-2 border-[var(--primary-container)]">
              <p className="text-xs font-bold text-white mb-1">DRN-ALPHA: SCAN SECTOR 7G</p>
              <p className="text-[11px] text-[var(--on-surface-variant)] leading-relaxed">Agent prioritizing thermal signature detection over visual confirmation due to fog density.</p>
              <div className="mt-2 flex gap-2">
                <span className="text-[9px] uppercase tracking-tighter text-neutral-500">ID: 4492-X</span>
                <span className="text-[9px] uppercase tracking-tighter text-[var(--tertiary)]">CONFIRMED</span>
              </div>
            </div>
            
            <div className="relative pl-4 border-l-2 border-[var(--outline-variant)]">
              <p className="text-xs font-bold text-neutral-400 mb-1">SWARM COHESION: RE-ALIGNMENT</p>
              <p className="text-[11px] text-[var(--on-surface-variant)] leading-relaxed">Adjusting mesh spacing to 15m to counter localized wind gusts (24kts).</p>
              <div className="mt-2 flex gap-2">
                <span className="text-[9px] uppercase tracking-tighter text-neutral-500">ID: 4495-Y</span>
                <span className="text-[9px] uppercase tracking-tighter text-[var(--primary)]">PROCESSING</span>
              </div>
            </div>
            
            <div className="relative pl-4 border-l-2 border-[var(--outline-variant)]">
              <p className="text-xs font-bold text-neutral-400 mb-1">GEO-FENCE: PERIMETER CHECK</p>
              <p className="text-[11px] text-[var(--on-surface-variant)] leading-relaxed">Verifying exclusion zone 04 boundaries against updated NAV-DATA packet 09.</p>
            </div>
          </div>
          
          <div className="mt-auto pt-6 border-t border-white/5">
            <div className="bg-[var(--surface-container-high)] rounded p-3">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase">LLM Load</span>
                <span className="text-sm font-black text-[var(--primary)]">42%</span>
              </div>
              <div className="w-full h-1 bg-[var(--surface-container)] rounded-full overflow-hidden">
                <div className="bg-[var(--primary-container)] h-full w-[42%]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CENTER: Agent Reasoning Graph & Map Layers ── */}
      <section className="flex-1 relative flex flex-col items-center p-8 overflow-hidden pointer-events-none">
         {/* Absolute HUD Overlays */}
         <div className="absolute top-6 left-6 flex gap-3 pointer-events-auto">
            <div className="px-3 py-1.5 bg-neutral-900/60 rounded border border-white/10 flex items-center gap-2">
              <span className="material-symbols-outlined text-xs text-[var(--primary)]">monitoring</span>
              <span className="text-[10px] font-bold tracking-wider text-white">REASONING LATENCY: 12ms</span>
            </div>
          </div>
          <div className="absolute bottom-6 right-6 pointer-events-auto">
            <div className="p-4 bg-[var(--surface-container-low)]/80 backdrop-blur-md rounded-lg border border-white/5 max-w-xs">
              <h3 className="text-[10px] font-bold text-[var(--on-surface-variant)] uppercase mb-2">Agent Logic Context</h3>
              <p className="text-[11px] text-[var(--on-surface-variant)] italic">"Swarm behavior is currently governed by the 'Mesh-Centric' protocol, favoring data redundancy over rapid traverse speeds."</p>
            </div>
          </div>

        {/* Central Node Graph */}
        <div className="w-full h-full relative flex flex-col items-center justify-center pointer-events-auto mt-20">
          <div className="reasoning-node relative mb-20 bg-[var(--surface-container-high)]/80 backdrop-blur-md border border-[var(--primary-container)] p-4 rounded-xl flex flex-col items-center w-64 glow-orange z-20">
            <span className="text-[10px] font-black tracking-widest text-[var(--primary-container)] mb-1 uppercase">Objective Root</span>
            <p className="text-sm font-bold text-center text-white text-shadow">OPTIMIZE SWARM COVERAGE</p>
          </div>
          <div className="flex gap-12 relative z-10">
            <div className="relative bg-[var(--surface-container)]/80 border border-white/10 p-3 rounded-lg w-48 flex flex-col items-start backdrop-blur-md shadow-xl transition-all hover:bg-[var(--surface-bright)]/80">
              <span className="text-[9px] text-[var(--tertiary)] mb-1 uppercase font-bold">Heuristic A</span>
              <p className="text-xs font-medium text-white">ENERGY CONSERVATION</p>
              <p className="text-[10px] text-[var(--on-surface-variant)] mt-2 leading-tight">Prioritize low-altitude glide paths to save battery life during transition.</p>
            </div>
            <div className="relative bg-[var(--surface-container)]/90 border border-[var(--primary-container)] p-3 rounded-lg w-48 flex flex-col items-start shadow-[0_0_15px_rgba(255,92,0,0.15)] ring-1 ring-[var(--primary-container)]">
              <span className="text-[9px] text-[var(--primary)] mb-1 uppercase font-bold">Heuristic B</span>
              <p className="text-xs font-medium text-white">DATA FIDELITY</p>
              <p className="text-[10px] text-[var(--on-surface-variant)] mt-2 leading-tight">Increase hover duration over Sector 4 to ensure clear LiDAR return.</p>
            </div>
          </div>
          
          <div className="flex gap-8 mt-20">
            <div className="bg-[var(--surface-container-high)]/40 border border-white/5 p-2 rounded text-[10px] text-neutral-500">
                Path: Delta-01 (Inactive)
            </div>
            <div className="bg-[var(--surface-container-high)] border border-[var(--tertiary)] p-2 rounded text-[10px] text-white flex items-center gap-2 shadow-[0_0_10px_rgba(71,226,102,0.1)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--tertiary)] animate-pulse"></div>
                Current Reasoning Path: Gamma-Active
            </div>
            <div className="bg-[var(--surface-container-high)]/40 border border-white/5 p-2 rounded text-[10px] text-neutral-500">
                Path: Epsilon-02 (Standby)
            </div>
          </div>
        </div>
      </section>

      {/* ── RIGHT PANEL: Safety Validator ── */}
      <section className="w-80 flex flex-col gap-4 pointer-events-auto h-full">
        <div className="glass-panel bg-neutral-950/60 border border-white/10 rounded-[1rem] flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-black tracking-[0.2em] uppercase text-[var(--on-surface-variant)]">Safety Validator</h2>
            <span className="material-symbols-outlined text-[var(--tertiary)]">verified_user</span>
          </div>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-[var(--surface-container-low)] border-l-2 border-[var(--tertiary)]">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-white">AIRSPACE DECONGESTION</span>
                <span className="material-symbols-outlined text-[14px] text-[var(--tertiary)]">check_circle</span>
              </div>
              <p className="text-[10px] text-[var(--on-surface-variant)]">No commercial air traffic detected within a 5-mile radius. Altitude clear.</p>
            </div>
            
            <div className="p-3 rounded-lg bg-[var(--surface-container-low)] border-l-2 border-[var(--tertiary)]">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-white">GEO-FENCE COMPLIANCE</span>
                <span className="material-symbols-outlined text-[14px] text-[var(--tertiary)]">check_circle</span>
              </div>
              <p className="text-[10px] text-[var(--on-surface-variant)]">Current trajectories are 140m inside the authorized operational boundary.</p>
            </div>
            
            <div className="p-3 rounded-lg bg-[var(--error-container)]/10 border-l-2 border-[var(--error)]">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-[var(--error)]">POWER RESERVE ALERT</span>
                <span className="material-symbols-outlined text-[14px] text-[var(--error)] animate-pulse">warning</span>
              </div>
              <p className="text-[10px] text-[var(--error)]/70">DRN-004 reporting 18% charge. Agent has scheduled autonomous return to dock in T-120s.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM PANEL: Agent Command Terminal ── */}
      <section className="absolute bottom-6 left-[350px] right-[350px] h-32 glass-panel border border-white/10 rounded-2xl z-20 px-8 py-4 pointer-events-auto">
        <div className="flex flex-col h-full justify-between">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[var(--primary)] text-sm">terminal</span>
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Agent Command Terminal</label>
            </div>
            <MapLayerToggle />
          </div>
          <div className="relative flex-1">
            <input 
              className="w-full h-full bg-[var(--surface-container-high)]/50 border border-white/5 rounded-xl px-6 text-sm font-medium focus:ring-1 focus:ring-[var(--primary-container)]/50 focus:outline-none placeholder:text-neutral-600 text-white" 
              placeholder="Type new mission directive (e.g., 'Redirect swarm to thermal anomaly at Sector 3...')" 
              type="text"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-[var(--primary-container)] text-[var(--on-primary-container)] px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-orange-400 transition-colors shadow-lg shadow-orange-500/20">
              INJECT DIRECTIVE
            </button>
          </div>
          <div className="flex gap-4 mt-2">
            <span className="text-[9px] text-neutral-500">AUTO-COMPLETE SUGGESTIONS:</span>
            <button className="text-[9px] text-[var(--primary)] hover:underline outline-none">ABORT ALL MISSIONS</button>
            <button className="text-[9px] text-[var(--primary)] hover:underline outline-none">INITIATE GRID PATTERN 05</button>
            <button className="text-[9px] text-[var(--primary)] hover:underline outline-none">RETURN TO BASE (AUTO)</button>
          </div>
        </div>
      </section>
    </div>
  );
}
