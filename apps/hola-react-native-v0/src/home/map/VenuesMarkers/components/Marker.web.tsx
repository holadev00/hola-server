import { Text, View } from "react-native";

import L from "leaflet";
import { Marker } from "react-leaflet/Marker";
import { Popup } from "react-leaflet/Popup";
import { Feather } from '@expo/vector-icons';
import { Computed } from "@legendapp/state/react";

import { decimalToDMS } from "hola-home/components/bottomSheet/decimalToDMS";
import { iconsSVG } from "../../iconsSVG";
import { selected, onTransition } from "../state";
import { useFavoriteVenue } from "../hooks/useFavoriteVenue";
import { useVenueSelect } from "../hooks/useVenueSelect";

export function Marker_(venue) {
    const { isFavorite } = useFavoriteVenue(venue.id);
    const { centerMapOnVenue } = useVenueSelect(venue);

    const starFilledHTML = `
        <svg viewBox="0 0 1024 1024" width="16" fill="#fadb14">
            <path d="M908.1 353.1L636.7 313 512 64 387.3 313 115.9 353.1 316 547.7 263.7 816 512 681.3 760.3 816 708 547.7z"/>
        </svg>
        `;

    return <Computed>
        {() => {
            const isCurrent = selected.get()?.id === venue.id;
            const onTransition_ = onTransition.get();

            return <>
                <Marker
                    key="VENUE_POSTION_MARKER_ID"
                    eventHandlers={{
                        click: centerMapOnVenue
                    }}
                    icon={L.divIcon({
                        iconSize: [0, 0], html: `<div class="pin orange">
                            <div class="icon">
                                <img src="${iconsSVG.football}" alt="${venue.name}" style="width: 30px; aspect-ratio: 1; filter: invert(1); transform: translateY(-20px);" />
                            </div>
                            ${isFavorite.get() ? `<div class="favorite">${starFilledHTML}</div>` : ""}
                        </div>`
                    })}
                    position={[venue.latitude, venue.longitude]}>
                </Marker>
                {(isCurrent && !onTransition_) && <Popup offset={[0, -30]} mainWidth={100} maxWidth={"75%"} autoPan={false} autoPanPadding={[100, 100]} position={[venue.latitude, venue.longitude]} closeButton={false}>
                    <View style={{ maxWidth: 200 }}>
                        <Text style={{ color: "black", fontWeight: "bold", fontSize: 16 }} numberOfLines={1}>{venue.name}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                            <Feather name="map-pin" size={12} color="#aaa" />
                            <Text style={{ color: "#aaa", fontSize: 12 }} numberOfLines={1}>{venue.address ?? `${decimalToDMS(venue.latitude, true)}, ${decimalToDMS(venue.longitude, false)}`}</Text>
                        </View>
                    </View>
                </Popup>}
            </>;
        }}
    </Computed>
}