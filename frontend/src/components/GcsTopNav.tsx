"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function GcsTopNav() {
  const { username, logout } = useAuthStore();
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 bg-black/80 backdrop-blur-xl border-b border-white/10 h-14 pointer-events-auto">
      <div className="flex items-center gap-4">
        <span className="text-xl font-black tracking-tighter text-orange-600 dark:text-orange-500">
          AERION Mind
        </span>
        <div className="h-4 w-px bg-white/20"></div>
        <span className="font-['Inter'] tracking-tight uppercase font-bold text-xs text-orange-500">
          OS v4.2
        </span>
      </div>

      <nav className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-tight">
        <Link
          href="/dashboard"
          className={`${
            pathname === "/dashboard"
              ? "text-orange-500 font-bold border-b-2 border-orange-500 pb-1"
              : "text-orange-100/50 hover:text-white"
          } transition-colors duration-200`}
        >
          Tactical Matrix
        </Link>
        <Link
          href="/dashboard/agentic"
          className={`${
            pathname === "/dashboard/agentic"
              ? "text-orange-500 font-bold border-b-2 border-orange-500 pb-1"
              : "text-orange-100/50 hover:text-white"
          } transition-colors duration-200`}
        >
          Reasoning Layer
        </Link>
        <Link
          href="/dashboard/mission"
          className={`${
            pathname === "/dashboard/mission"
              ? "text-orange-500 font-bold border-b-2 border-orange-500 pb-1"
              : "text-orange-100/50 hover:text-white"
          } transition-colors duration-200`}
        >
          UTM Planner
        </Link>
      </nav>

      <div className="flex items-center gap-6">
        <div className="flex items-center space-x-4">
          <span className="material-symbols-outlined text-orange-100/70 text-lg hover:text-white cursor-pointer select-none">
            cell_tower
          </span>
          <span className="material-symbols-outlined text-orange-100/70 text-lg hover:text-white cursor-pointer select-none">
            wifi
          </span>
          <div className="h-6 w-6 rounded-full bg-[var(--surface-container-highest)] border border-white/10 flex items-center justify-center overflow-hidden">
            <span className="material-symbols-outlined text-sm select-none">
              account_circle
            </span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={logout}
            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-[10px] font-bold tracking-widest uppercase rounded transition-colors whitespace-nowrap"
          >
            {username} OUT
          </button>
          <button className="px-3 py-1 bg-[var(--primary-container)] text-[var(--on-primary-container)] text-[10px] font-bold tracking-widest uppercase rounded shadow-[0_0_12px_rgba(255,92,0,0.4)]">
            MISSION ACTIVE
          </button>
        </div>
      </div>
    </header>
  );
}
