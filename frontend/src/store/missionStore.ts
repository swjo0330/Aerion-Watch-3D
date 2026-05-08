import { create } from "zustand";

export interface Waypoint {
  id: string;
  lat: number;
  lng: number;
  alt: number;
  spd: number;
  status: "PENDING" | "SELECTED" | "REACHED";
}

interface MissionState {
  waypoints: Waypoint[];
  activeWaypointId: string | null;
  addWaypoint: (lat: number, lng: number, alt?: number) => void;
  updateWaypoint: (id: string, updates: Partial<Waypoint>) => void;
  removeWaypoint: (id: string) => void;
  setActiveWaypoint: (id: string) => void;
  clearMission: () => void;
}

export const useMissionStore = create<MissionState>((set) => ({
  waypoints: [
    // Provide initial default waypoints for Demo purposes if empty,
    // but right now let's just initialize it empty.
  ],
  activeWaypointId: null,

  addWaypoint: (lat, lng, alt = 150) =>
    set((state) => {
      const newId = `WP-${state.waypoints.length + 1}`;
      const newWaypoint: Waypoint = {
        id: newId,
        lat,
        lng,
        alt,
        spd: 15, // Default speed
        status: "PENDING",
      };
      
      return {
        waypoints: [...state.waypoints, newWaypoint],
        activeWaypointId: newId, // Select newly added WP
      };
    }),

  updateWaypoint: (id, updates) =>
    set((state) => ({
      waypoints: state.waypoints.map((wp) =>
        wp.id === id ? { ...wp, ...updates } : wp
      ),
    })),

  removeWaypoint: (id) =>
    set((state) => ({
      waypoints: state.waypoints.filter((wp) => wp.id !== id),
      activeWaypointId: state.activeWaypointId === id ? null : state.activeWaypointId,
    })),

  setActiveWaypoint: (id) =>
    set(() => ({
      activeWaypointId: id,
    })),

  clearMission: () =>
    set(() => ({
      waypoints: [],
      activeWaypointId: null,
    })),
}));
