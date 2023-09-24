import {useCallback, useEffect, useState} from "react";
import io, {Socket} from "socket.io-client";

export const useWebSocket = () => {
  const [socket, setSocket] = useState<Socket>(null);

  const socketInitializer = useCallback(async () => {
    await fetch('/api/socket')
    const socketInstance = io();

    socketInstance.on('connect', () => {
      setSocket(socketInstance);
    });
  }, []);

  useEffect(() => {
    if (!socket) {
      socketInitializer();
    }
  }, [socket]);

  return socket;
};
