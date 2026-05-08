"use client";

import { useDroneStore } from "@/store/droneStore";

export default function MapLayerToggle() {
  const { activeMapLayer, setMapLayer } = useDroneStore();

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 p-1 bg-black/60 backdrop-blur-[20px] backdrop-saturate-[180%] rounded-full shadow-[0px_5px_30px_0px_rgba(0,0,0,0.22)] border border-white/10">
        <button
          onClick={() => setMapLayer("google")}
          className={`apple-caption px-5 py-2.5 rounded-full transition-all duration-300 select-none outline-none ${
            activeMapLayer === "google"
              ? "bg-[var(--apple-blue)] text-white shadow-sm"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          Google 3D
        </button>
        <button
          onClick={() => setMapLayer("vworld")}
          className={`apple-caption px-5 py-2.5 rounded-full transition-all duration-300 select-none outline-none ${
            activeMapLayer === "vworld"
              ? "bg-[var(--apple-blue)] text-white shadow-sm"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          VWorld 3D (Mass Model)
        </button>
      </div>
    </div>
  );
}
