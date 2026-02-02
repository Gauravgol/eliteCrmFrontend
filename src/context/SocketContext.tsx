import React, { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
    notification: { text: string; senderId?: string } | null;
    unreadCount: number;
    setUnreadCount: (count: number | ((prev: number) => number)) => void;
    clearNotification: () => void;
    connectUser: (userId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notification, setNotification] = useState<{ text: string; senderId?: string } | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef<Socket | null>(null);

    const initSocket = () => {
        if (socketRef.current) return socketRef.current;

        const newSocket = io(SOCKET_URL, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
        });

        newSocket.on("connect", () => {
            console.log("Global Socket connected:", newSocket.id);

            const user = JSON.parse(localStorage.getItem("user") || "{}");
            if (user.id) {
                newSocket.emit("online_user", { userId: user.id });
            }
        });

        newSocket.on("notification_received", (data: any) => {
            console.log("Notification event received:", data);

            // Handle the generic notification logic
            const text = data?.notification?.text || data?.text || "New message received";
            const senderId = data?.notification?.senderId;

            setNotification({ text, senderId });

            // If it's a general notification (not just a chat message), increment Navbar badge
            if (data.type === "NOTIFICATION") {
                setUnreadCount(prev => prev + 1);
            }

            // Auto-clear popup after 5 seconds
            setTimeout(() => {
                setNotification(null);
            }, 5000);
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
        return newSocket;
    };

    useEffect(() => {
        // Auto-init if user is already logged in
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.id) {
            initSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
        };
    }, []);

    const connectUser = (userId: string) => {
        const s = initSocket();
        if (s.connected) {
            s.emit("online_user", { userId });
            console.log("Emitted online_user for:", userId);
        } else {
            s.once("connect", () => {
                s.emit("online_user", { userId });
                console.log("Emitted online_user for (after delayed connect):", userId);
            });
        }
    };

    const clearNotification = () => setNotification(null);

    return (
        <SocketContext.Provider value={{ socket, notification, unreadCount, setUnreadCount, clearNotification, connectUser }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};
