"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Cookies from "js-cookie";

import { API_CONFIG } from "@/lib/api/config";

const SOCKET_URL = API_CONFIG.BASE_URL.replace("/api/", "");

let globalSocket: Socket | null = null;

export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(globalSocket);

    useEffect(() => {
        const token = Cookies.get("auth_token");
        if (!token) return;

        if (!globalSocket) {
            console.log("Initializing global socket...");
            globalSocket = io(SOCKET_URL, {
                auth: { token },
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: 10,
            });

            globalSocket.on("connect", () => {
                console.log("Socket connected:", globalSocket?.id);
                setSocket(globalSocket);
            });

            globalSocket.on("connect_error", (err) => {
                console.error("Socket connection error:", err.message);
            });
        } else if (!socket) {
            setSocket(globalSocket);
        }
    }, [socket]);

    return socket;
}
