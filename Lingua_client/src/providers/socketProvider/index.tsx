import { useEffect, type ReactNode } from "react";
import { socket, SocketContext } from "../../context/SocketContext";
interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
    useEffect(() => {
        // Bạn có thể lắng nghe các sự kiện socket cơ bản ở đây
        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        // Cleanup khi unmount
        return () => {
            socket.off("connect");
            socket.off("disconnect");
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
