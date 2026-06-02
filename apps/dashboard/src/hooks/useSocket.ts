import { useEffect } from "react";
import { socket } from "../api/socket";

export const useSocket = (
event: string,
callback: (data: any) => void
) => {
useEffect(() => {
socket.on(event, callback);

return () => {
socket.off(event, callback);
};
}, [event, callback]);
};