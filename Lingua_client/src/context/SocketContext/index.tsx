import { io, Socket } from "socket.io-client";
import { createContext, useContext } from "react";

export const socket = io("http://localhost:3000");

// 2. Tạo Context
export const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket phải được dùng bên trong SocketProvider");
    }
    return context;
};
