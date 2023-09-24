import { createContext, useContext } from 'react';
import {Socket} from "socket.io-client";

export type ModalContextValue = {
    socket?: Socket;
};

export const SocketContext = createContext<ModalContextValue>({} as ModalContextValue);

export const useSocketContext = () => useContext(SocketContext);
