import { Pressable } from "react-native";
import { Computed } from "@legendapp/state/react";
import { Feather } from "@expo/vector-icons";

import colors from "@hola/ui/colors";
import { useSocket } from "@hola/socket";
import { DEFAULT_LOCATION } from "../constants/DEFAULT_LOCATION";
import userLocation from "../state/userLocation";
import userInputStore from "../state/userInputStore";
import { openUserInputModal } from "../functions/openUserInputModal";


export function ChangeLocationButton() {
    const socket = useSocket("/");

    return <Computed>{() => {
        const location = userLocation.get();
        if (!location) return <></>;

        return <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 4 }} onPress={async () => {
            const userInput = await openUserInputModal();

            if (!userInput && !location) {
                userLocation.set({
                    latitude: DEFAULT_LOCATION.latitude,
                    longitude: DEFAULT_LOCATION.longitude
                });
                return;
            }

            socket.emit('geocode', userInput, userInputStore.search.result.set);
            console.log("Position input par l'utilisateur", userInput);
        }}>
            <Feather name="settings" size={20} color={colors.foreground} />
            {/* <Text style={{ color: "dodgerblue" }}>{t(`home.address.change`)}</Text> */}
        </Pressable>
    }}</Computed>;
}