import { Platform, Text, View } from "react-native";
import * as UserLocation from "@hola/userLocation";
import { ActivityIndicator } from "react-native";
import { Computed } from "@legendapp/state/react";
import { WebMap } from "./map";

export function HomeScreenMap() {
    return <Computed>
        {() => {
            const { latitude, longitude } = UserLocation.userLocation.get();

            if (!latitude || !longitude) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                {/* <Text>Loading HomeScreenMap...</Text> */}
                <ActivityIndicator size="large" />
            </View>;
            else return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <WebMap latitude={latitude} longitude={longitude} />
            </View>;
        }}
    </Computed>;
}

