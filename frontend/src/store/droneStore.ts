import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { DroneState, TracePoint } from "@/types/drone";

const MAX_TRACE_POINTS = 1000;
const MAX_TRACE_AGE_MS = 10 * 60 * 1000; // 10분

interface DroneStore {
  drones: Record<string, DroneState>;
  traces: Record<string, TracePoint[]>;
  selectedDroneId: string | null;
  wsConnected: boolean;

  activeMapLayer: "google" | "vworld";
  
  updateDrone: (state: DroneState) => void;
  batchUpdateDrones: (states: DroneState[]) => void;
  removeDrone: (droneId: string) => void;
  selectDrone: (id: string | null) => void;
  setMapLayer: (layer: "google" | "vworld") => void;
  setWsConnected: (v: boolean) => void;
  clearAll: () => void;
  // added for global cmd passing:
  sendCommand: (droneId: string, command: string, params?: Record<string, unknown>) => void;
  setWsRef: (ws: WebSocket | null) => void;
}

export const useDroneStore = create<DroneStore>()(
  immer((set) => ({
    drones: {},
    traces: {},
    selectedDroneId: null,
    wsConnected: false,

    activeMapLayer: "google" as const,

    updateDrone: (state) =>
      set((s) => {
        s.drones[state.drone_id] = state;

        if (state.trace) {
          const now = Date.now();
          const prev = s.traces[state.drone_id] ?? [];
          const newPoint: TracePoint = {
            lng: state.pos.lng,
            lat: state.pos.lat,
            alt: state.pos.alt_msl,
            ts: now,
          };
          const filtered = prev.filter((p) => now - p.ts < MAX_TRACE_AGE_MS);
          filtered.push(newPoint);
          if (filtered.length > MAX_TRACE_POINTS) {
            filtered.splice(0, filtered.length - MAX_TRACE_POINTS);
          }
          s.traces[state.drone_id] = filtered;
        }
      }),

    // 300대 일괄 업데이트 → set 1회 → 렌더 1회
    batchUpdateDrones: (states) =>
      set((s) => {
        const now = Date.now();
        for (const state of states) {
          s.drones[state.drone_id] = state;
          if (state.trace) {
            const prev = s.traces[state.drone_id] ?? [];
            const newPoint: TracePoint = {
              lng: state.pos.lng,
              lat: state.pos.lat,
              alt: state.pos.alt_msl,
              ts: now,
            };
            const filtered = prev.filter((p) => now - p.ts < MAX_TRACE_AGE_MS);
            filtered.push(newPoint);
            if (filtered.length > MAX_TRACE_POINTS) {
              filtered.splice(0, filtered.length - MAX_TRACE_POINTS);
            }
            s.traces[state.drone_id] = filtered;
          }
        }
      }),

    removeDrone: (droneId) =>
      set((s) => {
        delete s.drones[droneId];
        delete s.traces[droneId];
        if (s.selectedDroneId === droneId) s.selectedDroneId = null;
      }),

    selectDrone: (id) =>
      set((s) => {
        s.selectedDroneId = id;
      }),

    setMapLayer: (layer) =>
      set((s) => {
        s.activeMapLayer = layer;
      }),

    setWsConnected: (v) =>
      set((s) => {
        s.wsConnected = v;
      }),

    clearAll: () =>
      set((s) => {
        s.drones = {};
        s.traces = {};
        s.selectedDroneId = null;
      }),
      
    // Store WS externally
    setWsRef: (ws) => 
      set((s: any) => { 
        s.__wsRef = ws; 
      }),
      
    sendCommand: (droneId, command, params = {}) =>
      set((s: any) => {
        if (s.__wsRef && s.__wsRef.readyState === WebSocket.OPEN) {
          s.__wsRef.send(JSON.stringify({ type: "command", drone_id: droneId, command, params }));
        }
      }),
  }))
);
