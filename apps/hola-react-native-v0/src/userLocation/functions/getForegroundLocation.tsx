import * as Location from "expo-location";
import { Platform } from "react-native";
import { logger } from "../constants/logger";

export async function getForegroundLocation() {
    const { granted, status } = await Location.requestForegroundPermissionsAsync();

    if (!granted) {
        if (logger) console.log('Permission refusée');
        return null;
    }

    const position = await new Promise((resolve) => {
        setTimeout(() => resolve(null), 3000);
        Location.getCurrentPositionAsync({
            accuracy: Platform.OS === "android"
                ? Location.Accuracy.Balanced
                : Location.Accuracy.High,
            mayShowUserSettingsDialog: true,
        }).catch(() => resolve(null)).then(resolve);
    });

    if (!position) {
        if (logger) console.log('Timeout : position non obtenue');
        return null;
    }

    return {
        latitude: position?.coords?.latitude,
        longitude: position?.coords?.longitude,
    };
}
