import { View, Text } from "react-native";

export function SlotSelectorHeader() {
    return <View style={{ flexDirection: "row", gap: 8 }}>
        <Text style={{ fontWeight: "bold", minWidth: 60 }}>hour</Text>
        <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "bold" }}>Slots</Text>
        </View>
        {/* <Text style={{ fontWeight: "bold" }}>filmed only</Text> */}
    </View>;
}
