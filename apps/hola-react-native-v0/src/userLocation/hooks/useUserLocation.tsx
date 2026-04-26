import { useSocket } from "@hola/socket";
import { useEffect } from "react";
import { DEFAULT_LOCATION } from "../constants/DEFAULT_LOCATION";
import { getForegroundLocation } from "../functions/getForegroundLocation";
import { openUserInputModal } from "../functions/openUserInputModal";
import userInputStore from "../state/userInputStore";
import userLocation from "../state/userLocation";
import type { UserLocation } from "../types/UserLocation";
import { logger } from "../constants/logger";

export function useUserLocation() {
    const socket = useSocket("/");

    useEffect(() => {
        let position: UserLocation | null = null;

        const cb = async (response) => {
            if(logger) console.log('Position reçue par le serveur', response);

            if (response) {
                userLocation.set({
                    address: response?.address,
                    latitude: response?.latitude ?? response?.lat,
                    longitude: response?.longitude ?? response?.lng
                });
                return;
            }

            const userInput = await openUserInputModal();

            if (!userInput) {
                userLocation.set({
                    address: "Rouen",
                    latitude: DEFAULT_LOCATION.latitude,
                    longitude: DEFAULT_LOCATION.longitude
                });
                return;
            }

            socket?.emit('geocode', userInput, userInputStore.search.result.set);
            if(logger) console.log("Position input par l'utilisateur", userInput);
        };

        const init = async () => {
            setTimeout(() => {
                position = null;
            }, 3000);
            position = await getForegroundLocation();

            if(logger) console.log('Position reçue par le client', position);

            if (position) {
                socket?.emit('USER/location/set', position);
                userLocation.set({
                    latitude: position.latitude,
                    longitude: position.longitude
                });
                return;
            }

            socket?.emit('USER/location/get', cb);
        };

        init();
        socket?.on('connect', init);

        return () => {
            socket?.off('connect');
        };
    }, []);
}
