import { useSocket } from "@hola/socket";

export function useVenuesSocket() {
    const socket = useSocket("/");

    return socket;
}
