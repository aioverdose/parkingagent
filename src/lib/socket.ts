/**
 * Socket.io client wrapper with REST polling fallback.
 *
 * If SOCKET_SERVER env is set, connects to the WebSocket server.
 * Otherwise, returns null and the app uses REST polling.
 */

const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_SERVER || "";

let socketInstance: any = null;

export type SocketCallbacks = {
  onLocationUpdate?: (data: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    timestamp: string;
  }) => void;
  onMatchState?: (data: { matchState: string; message?: string }) => void;
  onArrivalConfirmed?: () => void;
  onDepartureStarted?: () => void;
};

export async function connectSocket(
  matchId: string,
  userId: string,
  role: "arriving" | "departing",
  callbacks: SocketCallbacks,
): Promise<() => void> {
  if (!SOCKET_SERVER) {
    return () => {};
  }

  try {
    // @ts-expect-error - socket.io-client is optional; falls back to REST polling if not installed
    const { io } = await import("socket.io-client");

    if (socketInstance) socketInstance.disconnect();

    socketInstance = io(SOCKET_SERVER, {
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("[socket] Connected to Socket.io server");
      socketInstance.emit("join:match", { matchId, userId, role });
    });

    if (callbacks.onLocationUpdate) {
      socketInstance.on("location:update", callbacks.onLocationUpdate);
    }
    if (callbacks.onMatchState) {
      socketInstance.on("match:state", callbacks.onMatchState);
    }
    if (callbacks.onArrivalConfirmed) {
      socketInstance.on("arrival:confirmed", callbacks.onArrivalConfirmed);
    }
    if (callbacks.onDepartureStarted) {
      socketInstance.on("departure:started", callbacks.onDepartureStarted);
    }

    socketInstance.on("disconnect", () => {
      console.log("[socket] Disconnected from Socket.io server");
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
      }
    };
  } catch (err) {
    console.warn("[socket] Socket.io not available, using REST polling", err);
    return () => {};
  }
}

export function emitLocationUpdate(matchId: string, latitude: number, longitude: number, heading?: number, speed?: number) {
  if (socketInstance?.connected) {
    socketInstance.emit("location:update", { matchId, latitude, longitude, heading, speed });
  }
}

export function emitMatchState(matchId: string, matchState: string, message?: string) {
  if (socketInstance?.connected) {
    socketInstance.emit("match:state", { matchId, matchState, message });
  }
}
