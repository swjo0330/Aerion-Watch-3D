"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function GcsSideNav() {
  const { username } = useAuthStore();
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] z-40 flex flex-col pt-4 bg-neutral-950/85 backdrop-blur-2xl border-r border-white/5 w-64 hidden md:flex pointer-events-auto">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--surface-container-high)] flex items-center justify-center border border-white/10">
            <span className="material-symbols-outlined text-[var(--primary-container)]">person</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[var(--primary-container)] tracking-tighter uppercase">{username ?? "OPERATOR-01"}</p>
            <p className="text-[9px] text-neutral-500 uppercase tracking-widest">RANK: COMMANDER</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        <Link href="/dashboard" className={`px-4 py-3 flex items-center gap-3 font-medium text-sm tracking-wide transition-all ${pathname === "/dashboard" ? "bg-[var(--primary-container)]/20 text-[var(--primary-container)] border-l-2 border-[var(--primary-container)]" : "text-neutral-500 hover:bg-white/5 hover:text-neutral-200"}`}>
          <span className="material-symbols-outlined text-sm select-none">grid_view</span>
          <span>Swarm Overview</span>
        </Link>
        <Link href="/dashboard/agentic" className={`px-4 py-3 flex items-center gap-3 font-medium text-sm tracking-wide transition-all ${pathname === "/dashboard/agentic" ? "bg-[var(--primary-container)]/20 text-[var(--primary-container)] border-l-2 border-[var(--primary-container)]" : "text-neutral-500 hover:bg-white/5 hover:text-neutral-200"}`}>
          <span className="material-symbols-outlined text-sm select-none">psychology</span>
          <span>Agent Reasoning</span>
        </Link>
        <Link href="/dashboard/mission" className={`px-4 py-3 flex items-center gap-3 font-medium text-sm tracking-wide transition-all ${pathname === "/dashboard/mission" ? "bg-[var(--primary-container)]/20 text-[var(--primary-container)] border-l-2 border-[var(--primary-container)]" : "text-neutral-500 hover:bg-white/5 hover:text-neutral-200"}`}>
          <span className="material-symbols-outlined text-sm select-none">route</span>
          <span>Mission Planner</span>
        </Link>
        <div className="text-neutral-500 px-4 py-3 flex items-center gap-3 hover:bg-white/5 hover:text-neutral-200 transition-all font-medium text-sm tracking-wide cursor-pointer">
          <span className="material-symbols-outlined text-sm select-none">settings_heart</span>
          <span>System Health</span>
        </div>
      </nav>

      <div className="px-4 pb-6 mt-auto">
        <button className="w-full bg-[var(--primary-container)] text-[var(--on-primary-container)] py-3 rounded-[1rem] font-bold text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(255,92,0,0.2)] hover:scale-[0.98] transition-transform">
          DEPLOY SWARM
        </button>
        <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
          <div className="text-neutral-500 px-4 py-2 flex items-center gap-3 hover:text-neutral-200 text-xs cursor-pointer">
            <span className="material-symbols-outlined text-xs select-none">terminal</span>
            <span>Logs</span>
          </div>
          <div className="text-neutral-500 px-4 py-2 flex items-center gap-3 hover:text-neutral-200 text-xs cursor-pointer">
            <span className="material-symbols-outlined text-xs select-none">help_center</span>
            <span>Help</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
