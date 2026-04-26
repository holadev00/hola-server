import { useEffect } from "react";
import { favorites } from "../state";
import { useVenuesSocket } from "./useVenuesSocket";

export function useFavoriteVenue(id) {
    const socket = useVenuesSocket();
    const isFavorite = favorites?.[id];

    useEffect(() => {
        socket.on('VENUES/favorite/update', ({ venueID, active }) => {
            favorites?.[venueID]?.set(active);
        });
    }, []);

    const get = () => {
        socket.emit('VENUES/favorite/get', id, favorites?.[id]?.set);
    };

    useEffect(() => {
        get();

        socket.on('connect', get);

        return () => {
            socket.off('connect', get);
        };
    }, []);

    return { isFavorite };
}
