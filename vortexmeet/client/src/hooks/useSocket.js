// hooks/useSocket.js
// Manages a single Socket.io connection for the logged-in user.
// Returns the socket instance so components can emit and listen.

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socketInstance = null; // Singleton — one connection per browser tab

export const useSocket = (user) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    // Reuse existing connection if available
    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io(SOCKET_URL, {
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketInstance.on("connect", () => {
        console.log("✅ Socket connected:", socketInstance.id);
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("🔌 Socket disconnected:", reason);
      });
    }

    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on unmount — other components may still need the socket
    };
  }, [user]);

  return socketRef.current;
};

// Call this when the user logs out to cleanly close the connection
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
