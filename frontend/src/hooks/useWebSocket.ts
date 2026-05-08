"use client";

import { useEffect, useRef } from "react";
import { useDroneStore } from "@/store/droneStore";
import { useAuthStore } from "@/store/authStore";
import type { WsMessage } from "@/types/drone";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws";
const RECONNECT_DELAY_MS = 2000;

export function useWebSocket(token: string | null) {
  const { updateDrone, batchUpdateDrones, removeDrone, clearAll, setWsConnected, setWsRef } = useDroneStore();
  const { logout } = useAuthStore();
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    if (!token) return;

    activeRef.current = true;

    function connect() {
      if (!activeRef.current) return;

      const url = `${WS_BASE}?token=${encodeURIComponent(token!)}`;
      console.log("[WS] connecting →", url.replace(/token=.+/, "token=<JWT>"));
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setWsRef(ws);

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg: WsMessage = JSON.parse(event.data as string);
          if (msg.type === "snapshot") {
            clearAll();
            msg.data.forEach(updateDrone);
          } else if (msg.type === "drone_update") {
            updateDrone(msg.data);
          } else if (msg.type === "batch_update") {
            batchUpdateDrones(msg.data);
          } else if (msg.type === "drone_remove") {
            removeDrone(msg.data.drone_id);
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = (ev) => {
        setWsConnected(false);
        wsRef.current = null;
        if (!activeRef.current) return;
        if (ev.code === 4001) {
          // 토큰 만료/무효 → 로그아웃 후 로그인 화면으로
          logout();
          return;
        }
        timerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      ws.onerror = () => {
        // onclose가 자동으로 호출되므로 별도 처리 불필요
      };
    }

    connect();

    return () => {
      activeRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      wsRef.current?.close();
      setWsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function sendCommand(droneId: string, command: string, params: Record<string, unknown> = {}) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "command", drone_id: droneId, command, params }));
    }
  }

  return { sendCommand };
}
