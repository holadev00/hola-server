import colors from "@hola/ui/colors";
import { View, Text } from "react-native";

export function Empty() {
    return <View style={{ flex: 1, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee' }}>
        <Text style={{ color: colors.muted }}>Empty</Text>
    </View>;
}
