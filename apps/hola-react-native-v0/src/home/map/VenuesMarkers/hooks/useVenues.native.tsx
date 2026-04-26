import { useEffect } from "react";
import { fixAndCast } from "../fixAndCast";
import { bounds, venues } from "../state";
import { useVenuesSocket } from "./useVenuesSocket";

export function useVenues() {
    const socket = useVenuesSocket();

    const getVenues = () => {
        const spreader = 0.01;

        socket.emit('VENUES/map/get', {
            latMin: bounds.get().latMin - spreader,
            latMax: bounds.get().latMax + spreader,
            lngMin: bounds.get().lngMin - spreader,
            lngMax: bounds.get().lngMax + spreader
        }, ({ radiusKm, venues: venues_ }) => {
            if (!venues_) return;
            //console.log('Received venues:', radiusKm);
            venues.set(venues_);
        });
    };

    useEffect(() => {
        getVenues();
        socket.on('connect', getVenues);

        bounds.onChange(() => {
            getVenues();
        });

        return () => {
            socket.off('connect', getVenues);
        };
    }, []);

    const updateBounds = () => {
        const expand = 0.01;
        return bounds.set({
            //latMin: fixAndCast(map.getBounds().getSouth() - expand),
            //latMax: fixAndCast(map.getBounds().getNorth() + expand),
            //lngMin: fixAndCast(map.getBounds().getWest() - expand),
            //lngMax: fixAndCast(map.getBounds().getEast() + expand),
        });
    };

    //const map = useMapEvent("move", updateBounds);
    useEffect(() => { updateBounds(); }, []);
}
