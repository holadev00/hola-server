import { observe } from "@legendapp/state";
import { observable } from "@legendapp/state";

export const venues = observable<Venue[]>([]);
export const favorites = observable<{ [id: string]: boolean }>({});
export const bounds = observable<{
    latMin: number;
    latMax: number;
    lngMin: number;
    lngMax: number;
}>({
    latMin: 0,
    latMax: 0,
    lngMin: 0,
    lngMax: 0,
});
export const selected = observable<Venue | null>(null);
export const center = observable<{
    lat: number;
    lng: number;
}>({
    lat: 0,
    lng: 0,
});
export const onTransition = observable<boolean>(false);