"use client";

import { useDroneStore } from "@/store/droneStore";
import { useAuthStore } from "@/store/authStore";

export default function StatusBar() {
  const { wsConnected, drones } = useDroneStore();
  const { username, logout } = useAuthStore();

  return (
    <div className="flex items-center justify-between px-6 py-2 h-[48px] bg-black/80 backdrop-blur-[20px] backdrop-saturate-[180%] border-b border-white/[0.05] flex-shrink-0 z-40 relative">
      <div className="flex items-center gap-4">
        <span className="text-white apple-body font-semibold tracking-wide flex items-center gap-2">
          {/* subtle apple icon outline if desired, or just text */}
          SkyWatch-RT
        </span>
        <div className="flex items-center gap-1.5 ml-2 mt-0.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${wsConnected ? "bg-green-500 shadow-[0_0_5px_currentColor]" : "bg-red-500"}`}
          />
          <span className="apple-caption text-[#86868b]">
            {wsConnected ? "연결됨" : "연결 끊김"}
          </span>
        </div>
        <span className="apple-caption text-[#86868b] border-l border-white/10 pl-4 ml-2 mt-0.5">
          드론 {Object.keys(drones).length}대
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="apple-caption text-[#86868b]">{username}</span>
        <button
          onClick={logout}
          className="apple-caption text-[#86868b] hover:text-white transition-colors px-3 py-1 rounded-full hover:bg-white/10 select-none outline-none"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
