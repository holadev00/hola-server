import { Suspense, useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import { mapLayers } from "./layers";

import { useMap as useMapLeaflet, useMapEvents } from "react-leaflet/hooks";
import { MapContainer } from "react-leaflet/MapContainer";
import { Marker } from "react-leaflet/Marker";
import { TileLayer } from "react-leaflet/TileLayer";
import { Tooltip } from "react-leaflet";
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { Computed } from "@legendapp/state/react";

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'
import './map.css';

import colors from "@hola/ui/colors";
import { iconsSVG } from "./iconsSVG";
import { extMapEvents } from "./extMapEvents";
import { useNavigation } from "@react-navigation/native";

import * as VenuesMarkers from "./VenuesMarkers";
import { useMobileLayout } from "@hola/navigation/hooks/useMobileLayout";

export function WebMap({ latitude, longitude }) {
    if (Platform.OS !== "web") return null;

    return (
        <Suspense fallback={<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>Loading map...</Text>
            <ActivityIndicator size="large" />
        </View>}>
            <Computed>
                {() => <View style={{ height: "100%", width: "100%", position: "relative" }}>
                    <MapContainer
                        style={{ height: "100%", width: "100%" }}
                        center={[latitude, longitude]}
                        zoom={16}
                        scrollWheelZoom
                        zoomControl={false}>
                        {mapLayers.map((layer, index) => <TileLayer key={index} url={layer.url} tileSize={512} zoomOffset={-1} />)}
                        <UserMarker latitude={latitude} longitude={longitude} />
                        <VenuesMarkers.View />
                        <Recenter user={[latitude, longitude]} />
                        <SettingsButton />
                    </MapContainer>
                </View>}
            </Computed>
        </Suspense>
    );
}

export function UserMarker({ latitude, longitude }) {
    const map = useMapLeaflet();

    useEffect(() => {
        map.setView([latitude, longitude], 16);
    }, [latitude, longitude]);

    return <Computed>
        {() => <Marker
            key="OWN_POSTION_MARKER_ID"
            eventHandlers={{
                click: () => {
                    //console.log("OWN_POSTION_MARKER_ID");
                    map.setView([latitude, longitude], 16);
                    VenuesMarkers.selected.set(null);
                }
            }}
            icon={L.divIcon({
                iconSize: [0, 0], html: `<div class="pin blue">
                    <div class="icon">
                        <img src="${iconsSVG.user}" alt="user" style="width: 30px; height: 30px; aspect-ratio: 1; filter: invert(1); transform: translateY(-20px) scale(1);" />
                    </div>    
                </div>` })}
            position={[latitude, longitude]}>
            <Tooltip direction="top" offset={[0, -40]} opacity={0.7}>My location</Tooltip>
        </Marker>}
    </Computed>
}

export function Recenter({ user: [latitude, longitude] }) {
    const [show, setShow] = useState(false);

    const map = useMapEvents({
        move: () => {
            let { lat, lng } = map.getCenter();
            lat = Number(lat.toFixed(4));
            lng = Number(lng.toFixed(4));

            setShow(lat !== Number(latitude.toFixed(4)) || lng !== Number(longitude.toFixed(4)));
        },
        click: () => {
            VenuesMarkers.selected.set(null);
        }
    });

    useEffect(() => {
        extMapEvents.on('recenter', (latitude, longitude) => map.setView([latitude, longitude], 16));
    }, []);

    return show && <View style={{ zIndex: 999, position: "absolute", left: 0, top: 0, padding: 8, gap: 8 }}>
        <Pressable style={{ padding: 12, backgroundColor: colors.primary, borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 8 }} onPress={() => map.setView([latitude, longitude], 16)}>
            <AntDesign name="aim" size={18} color="white" />
            <Text style={{ color: "white" }}>Recentrer</Text>
        </Pressable>
    </View>
}

export function SettingsButton() {
    const { navigate } = useNavigation();
    const { mobile } = useMobileLayout();

    return mobile && <View style={{ zIndex: 999, position: "absolute", right: 0, top: 0, padding: 8, gap: 8 }}>
        <Pressable style={{ padding: 8, backgroundColor: colors.primary, borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 8, aspectRatio: 1 }}>
            <MaterialCommunityIcons
                name="cog-outline"
                size={28}
                color={"white"}
                onPress={() => navigate('CustomerSettings')} />
        </Pressable>
    </View>;
}