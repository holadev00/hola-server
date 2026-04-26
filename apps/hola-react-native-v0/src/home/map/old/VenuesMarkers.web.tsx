import { useEffect } from "react";
import { Text, View } from "react-native";

import { useMap as useMapLeaflet, useMapEvents, useMapEvent } from "react-leaflet/hooks";
import { Marker } from "react-leaflet/Marker";
import { Popup } from "react-leaflet/Popup";
import MarkerClusterGroup from 'react-leaflet-cluster';
import { AntDesign, Feather } from '@expo/vector-icons';
import { observable } from "@legendapp/state";
import { Computed, useObserveEffect } from "@legendapp/state/react";

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import { decimalToDMS } from "hola-home/components/bottomSheet/decimalToDMS";
import colors from "@hola/ui/colors";
import { useSocket } from "@hola/socket";
import { iconsSVG } from "./iconsSVG";

export const VenuesMarkers = {
    venues: observable([]),
    favorites: observable({}),
    bounds: observable({ latMin: 0, latMax: 0, lngMin: 0, lngMax: 0 }),
    selected: observable(null),
    center: observable({ lat: 0, lng: 0 }),
    onTransition: observable(false),

    fixAndCast(bound) {
        return Number(bound.toFixed(2));
    },

    useVenuesSocket() {
        const socket = useSocket("/");

        return socket;
    },

    useFavoriteVenue(id) {
        const socket = VenuesMarkers.useVenuesSocket();
        const isFavorite = VenuesMarkers?.favorites?.[id];

        useEffect(() => {
            socket.on('VENUES/favorite/update', ({ venueID, active }) => {
                VenuesMarkers?.favorites?.[venueID]?.set(active);
            });
        }, []);

        const get = () => {
            socket.emit('VENUES/favorite/get', id, VenuesMarkers?.favorites?.[id]?.set);
        }

        useEffect(() => {
            get();

            socket.on('connect', get);

            return () => {
                socket.off('connect', get);
            }
        }, []);

        return { isFavorite }
    },

    useVenues() {
        const socket = VenuesMarkers.useVenuesSocket();

        const getVenues = () => {
            const spreader = 0.01;

            socket.emit('VENUES/map/get', {
                latMin: VenuesMarkers.bounds.get().latMin - spreader,
                latMax: VenuesMarkers.bounds.get().latMax + spreader,
                lngMin: VenuesMarkers.bounds.get().lngMin - spreader,
                lngMax: VenuesMarkers.bounds.get().lngMax + spreader
            }, ({ radiusKm, venues }) => {
                if (!venues) return;
                //console.log('Received venues:', radiusKm);
                VenuesMarkers.venues.set(venues);
            });
        }

        useEffect(() => {
            getVenues();
            socket.on('connect', getVenues);

            VenuesMarkers.bounds.onChange(() => {
                getVenues();
            });

            return () => {
                socket.off('connect', getVenues);
            }
        }, []);

        const updateBounds = () => {
            const expand = 0.01;
            return VenuesMarkers.bounds.set({
                latMin: VenuesMarkers.fixAndCast(map.getBounds().getSouth() - expand),
                latMax: VenuesMarkers.fixAndCast(map.getBounds().getNorth() + expand),
                lngMin: VenuesMarkers.fixAndCast(map.getBounds().getWest() - expand),
                lngMax: VenuesMarkers.fixAndCast(map.getBounds().getEast() + expand),
            });
        };
        const map = useMapEvent("move", updateBounds);
        useEffect(() => { updateBounds(); }, []);
    },

    View() {
        VenuesMarkers.useVenues();
        const map = useMapEvents({
            move: () => VenuesMarkers.center.set(map.getCenter()),
            click: () => VenuesMarkers.selected.set(null),
        });

        return <MarkerClusterGroup chunkedLoading>
            <Computed>
                {() => VenuesMarkers?.venues?.get().map(({ latitude, longitude, name, address, id }, index) => {
                    return <VenuesMarkers.Marker
                        key={id}
                        latitude={latitude}
                        longitude={longitude}
                        name={name}
                        address={address}
                        id={id} />;
                })}
            </Computed>
        </MarkerClusterGroup>
    },

    useVenueSelect(venue) {
        const map = useMapLeaflet();
        const isCentered = () => {
            const gap = 0.0001;

            return VenuesMarkers.center.get()?.lat > venue.latitude - gap &&
                VenuesMarkers.center.get()?.lat < venue.latitude + gap &&
                VenuesMarkers.center.get()?.lng > venue.longitude - gap &&
                VenuesMarkers.center.get()?.lng < venue.longitude + gap;
        }

        useObserveEffect(VenuesMarkers.center, () => {

            const isNear = isCentered();
            if (isNear) VenuesMarkers.onTransition.set(false);
        })

        return {
            centerMapOnVenue() {
                if (!isCentered() && VenuesMarkers.selected.get()?.id === venue.id) {
                    return VenuesMarkers.selected.set(null);
                }

                VenuesMarkers.onTransition.set(true);
                map.setView([venue.latitude, venue.longitude], 16);
                VenuesMarkers.selected.set(venue);
            }
        }
    },

    Marker(venue) {
        const { isFavorite } = VenuesMarkers.useFavoriteVenue(venue.id);
        const { centerMapOnVenue } = VenuesMarkers.useVenueSelect(venue);

        const starFilledHTML = `
            <svg viewBox="0 0 1024 1024" width="16" fill="#fadb14">
                <path d="M908.1 353.1L636.7 313 512 64 387.3 313 115.9 353.1 316 547.7 263.7 816 512 681.3 760.3 816 708 547.7z"/>
            </svg>
            `;

        return <Computed>
            {() => {
                const isCurrent = VenuesMarkers.selected.get()?.id === venue.id;
                const onTransition = VenuesMarkers.onTransition.get();

                return <>
                    <Marker
                        key="VENUE_POSTION_MARKER_ID"
                        eventHandlers={{
                            click: centerMapOnVenue
                        }}
                        icon={L.divIcon({
                            iconSize: [0, 0], html: `<div class="pin orange"> <div class="icon"> <img src="${iconsSVG.football}" alt="${venue.name}" style="width: 30px; aspect-ratio: 1; filter: invert(1); transform: translateY(-20px);" /> </div> ${isFavorite.get() ? `<div class="favorite">${starFilledHTML}</div>` : ""} </div>`
                        })}
                        position={[venue.latitude, venue.longitude]}>
                    </Marker>
                    {(isCurrent && !onTransition) && <Popup offset={[0, -30]} mainWidth={100} maxWidth={"75%"} autoPan={false} autoPanPadding={[100, 100]} position={[venue.latitude, venue.longitude]} closeButton={false}>
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
    },

    FavoriteButton({ id }) {
        const socket = VenuesMarkers.useVenuesSocket();

        return <Computed>
            {() => {
                const liked = VenuesMarkers.favorites?.get()?.[id]

                const onPress = () => {
                    socket.emit('VENUES/favorite/toggle', id, liked, VenuesMarkers?.favorites?.[id]?.set);
                }

                return <View style={{ height: 32, width: 32, alignItems: "center", justifyContent: "center" }}>
                    <AntDesign
                        name="star"
                        size={24}
                        color={liked ? colors.primary : "#ccc"}
                        onPress={onPress} />
                </View>;
            }}
        </Computed>
    }
}