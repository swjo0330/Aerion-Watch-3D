"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import GcsTopNav from "@/components/GcsTopNav";
import GcsSideNav from "@/components/GcsSideNav";

// CesiumJS는 SSR 불가 → dynamic import
const CesiumViewer = dynamic(() => import("@/components/CesiumViewer"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/90">
      <div className="text-white/50 text-sm font-mono uppercase tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 rounded-full border border-white/50 border-t-white animate-spin"></span>
        Loading Tactical Space...
      </div>
    </div>
  ),
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();

  // 전역 데이터 수신: Dashboard에 들어오는 순간 웹소켓 즉각 연결
  useWebSocket(token);

  useEffect(() => {
    if (!token) {
      router.replace("/");
    }
  }, [token, router]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--surface-container-lowest)] text-white select-none">
      <GcsTopNav />
      {/* 3D 배경 (가장 아래 레이어: z-0) */}
      <div className="absolute inset-0 pt-14 z-0 bg-[var(--surface-container-lowest)] opacity-80 mix-blend-screen pointer-events-none">
         {/* CesiumViewer 자체는 포인터 이벤트를 받아야하지만, mix-blend 때문에 래퍼를 따로 둠 */}
      </div>
      <div className="absolute inset-0 pt-14 z-0">
          <CesiumViewer />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,black_100%)] opacity-40"></div>
      </div>

      <div className="flex flex-1 overflow-hidden z-10 pt-14 pointer-events-none">
        <GcsSideNav />

        {/* Main Content Area (children)는 SideNav 우측에 위치하며 pointer-events를 통과시켜 바닥 지도를 조작할 수 있게 하거나 패널 자체만 이벤트를 먹게 함 */}
        <main className="relative flex-1 md:ml-64 h-[calc(100vh-3.5rem)] flex flex-col pointer-events-none">
           {children}
        </main>
      </div>
    </div>
  );
}
