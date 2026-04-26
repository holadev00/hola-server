import { Feather } from "@expo/vector-icons";
import { spacing } from "@hola/ui";

export function leftHeaderBack(navigation, backDefaultScreen) {
    return {
        headerLeft(props) {
            return <Feather name="arrow-left" size={28} onPress={() => {
                navigation?.canGoBack() ? navigation?.goBack() : navigation?.navigate(backDefaultScreen);
            }} />
        },
        headerLeftContainerStyle: { marginLeft: spacing.md }
    }
}