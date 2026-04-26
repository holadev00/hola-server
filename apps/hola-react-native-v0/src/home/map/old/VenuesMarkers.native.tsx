import { observable } from "@legendapp/state";

export const VenuesMarkers = {
    venues: observable([]),
    favorites: observable({}),
    bounds: observable({ latMin: 0, latMax: 0, lngMin: 0, lngMax: 0 }),
    selected: observable(null),
    center: observable({ lat: 0, lng: 0 }),
    onTransition: observable(false),
    zoom: observable(16),
    map: observable(null),
}