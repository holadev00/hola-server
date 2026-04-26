import { useObserveEffect } from "@legendapp/state/react";
import { selected, center, onTransition } from "../state";

export function useVenueSelect(venue) {
    //const map = useMapLeaflet();
    const isCentered = () => {
        const gap = 0.0001;

        return center.get()?.lat > venue.latitude - gap &&
            center.get()?.lat < venue.latitude + gap &&
            center.get()?.lng > venue.longitude - gap &&
            center.get()?.lng < venue.longitude + gap;
    }

    useObserveEffect(center, () => {

        const isNear = isCentered();
        if (isNear) onTransition.set(false);
    })

    return {
        centerMapOnVenue() {
            if (!isCentered() && selected.get()?.id === venue.id) {
                return selected.set(null);
            }

            onTransition.set(true);
            //map.setView([venue.latitude, venue.longitude], 16);
            selected.set(venue);
        }
    }
}