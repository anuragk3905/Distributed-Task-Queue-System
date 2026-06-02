import { io } from "socket.io-client";

export const socket = io(
import.meta.env.VITE_SOCKET_URL,
{
reconnection: true,
reconnectionAttempts: 10,
reconnectionDelay: 1000,
reconnectionDelayMax: 30000,
timeout: 20000,
}
);