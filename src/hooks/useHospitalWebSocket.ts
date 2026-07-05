import { useEffect, useRef } from "react";
import { getHospitalWebSocketUrl } from "@/lib/config";

export interface HospitalWsMessage {
  type: "hospital:created" | "hospital:updated";
  hospital: {
    id: string;
    latitude: number;
    longitude: number;
  };
}

interface UseHospitalWebSocketOptions {
  enabled?: boolean;
  onEvent: (message: HospitalWsMessage) => void;
}

const RECONNECT_MS = 3000;

export function useHospitalWebSocket({
  enabled = true,
  onEvent,
}: UseHospitalWebSocketOptions): void {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function connect() {
      if (cancelled) {
        return;
      }

      ws = new WebSocket(getHospitalWebSocketUrl());

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as HospitalWsMessage;
          if (
            message.type === "hospital:created" ||
            message.type === "hospital:updated"
          ) {
            onEventRef.current(message);
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, RECONNECT_MS);
        }
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      ws?.close();
    };
  }, [enabled]);
}
