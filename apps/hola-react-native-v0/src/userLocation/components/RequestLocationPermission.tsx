import { useSocket } from "@hola/socket";
import { colors } from "@hola/ui";
import React, { useState, useEffect } from "react";
import { Pressable, Text } from "react-native";
import userInputStore from "../state/userInputStore";
import userLocation from "../state/userLocation";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import { getForegroundLocation } from "../functions/getForegroundLocation";

export function RequestLocationPermission() {
    const [granted, setGranted] = useState<boolean>(false);
    const socket = useSocket("/");

    useEffect(() => {
        (async () => {
            const { granted } = await Location.getForegroundPermissionsAsync();
            setGranted(granted);
        })();
    }, []);

    return granted && <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 4 }} onPress={async () => {
        const position = await getForegroundLocation();

        if (position) {
            socket.emit('USER/location/set', position);
            userLocation.set({
                latitude: position.latitude,
                longitude: position.longitude
            });
            userInputStore.open.set(false);
            return;
        }
    }}>
        <Feather name="map-pin" size={14} color={colors.primary} />
        <Text style={{ color: colors.primary }}>Utiliser ma position actuelle</Text>
    </Pressable>
}