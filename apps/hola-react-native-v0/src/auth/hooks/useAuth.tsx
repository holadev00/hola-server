import { useSocket, bindSocketSync } from "@hola/socket";
import { useEffect } from "react";
import { handleAuthState } from "../states";
import { useNavigation } from "@react-navigation/native";

export function useAuth() {
    const socket = useSocket("/");
    const { navigate } = useNavigation();

    useEffect(() => {
        const off = bindSocketSync(socket, {
            listen: "AUTH/whoami",
            emit: "AUTH/whoami",
            payload: handleAuthState,
            onMessage: handleAuthState,
        });

        return off;
    }, [socket]);

    return {
        async logout() {
            await socket.emitWithAck("AUTH/logout");
            socket.on('AUTH/whoami', () => {
                setTimeout(() => navigate("CustomerAuth"), 1000);
            });
        }
    };
}
