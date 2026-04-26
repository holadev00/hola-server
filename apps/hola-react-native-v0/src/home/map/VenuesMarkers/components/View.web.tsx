import { useMapEvents } from "react-leaflet/hooks";
import { Computed } from "@legendapp/state/react";
import MarkerClusterGroup from "react-leaflet-cluster";
import { venues, selected, center } from "../state";
import { useVenues } from "../hooks/useVenues";
import { Marker_ } from "../components/Marker";

export function View() {
    useVenues();
    const map = useMapEvents({
        move: () => center.set(map.getCenter()),
        click: () => selected.set(null),
    });

    return <MarkerClusterGroup chunkedLoading>
        <Computed>
            {() => {
                return venues?.get().map(({ latitude, longitude, name, address, id }, index) => {
                    return <Marker_
                        key={id}
                        latitude={latitude}
                        longitude={longitude}
                        name={name}
                        address={address}
                        id={id} />;
                });
            }}
        </Computed>
    </MarkerClusterGroup>
}