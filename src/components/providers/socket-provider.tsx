"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { io as createSocketIOClient } from "socket.io-client";
import type { Socket } from "socket.io-client";

// Keep socket instance outside React component to persist across HMR
let globalSocket: Socket | null = null;

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false
});

export const useSocket = () => {
  return useContext(SocketContext);
};

function getSocketInstance() {
  if (!globalSocket) {
    globalSocket = createSocketIOClient({
      transports: ["websocket"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
  }
  return globalSocket;
}

export function SocketProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = getSocketInstance();
    socketRef.current = socket;

    function onConnect() {
      console.log("Socket connected with ID:", socket.id);
      setIsConnected(true);
    }

    function onDisconnect(reason: string) {
      console.log("Socket disconnected:", reason);
      setIsConnected(false);
      
      // If the disconnection was initiated by the server, try to reconnect
      if (reason === "io server disconnect") {
        socket.connect();
      }
    }

    function onConnectError(error: Error) {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    }

    // Add event listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    // Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Cleanup function
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      
      // Don't disconnect during development (HMR)
      if (process.env.NODE_ENV !== "development") {
        socket.disconnect();
      }
    };
  }, []); // Empty dependency array to run only once

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
} 