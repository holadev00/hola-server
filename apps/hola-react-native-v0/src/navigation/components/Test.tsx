import { useRoute } from "@react-navigation/core";
import { Text } from "react-native";

export function Test() {
    const route = useRoute();
    return <Text>
        {JSON.stringify(route, null, 4)}
    </Text>;
}
