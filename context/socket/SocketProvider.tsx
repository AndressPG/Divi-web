import { SocketContext } from './context';
import {ReactNode} from "react";
import {useWebSocket} from "../../lib/useWebSocket";

export const SocketProvider = ({ children }: {children: ReactNode}) => {
    const socket = useWebSocket();

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}
