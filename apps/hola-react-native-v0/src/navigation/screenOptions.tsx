import { colors, typography } from "@hola/ui";
import { Pressable, Text } from "react-native";
import Color from "colorjs.io";
import { useTabBarFocus } from "./hooks/useTabBarFocus";
import { tabBarItemColor, transparentMix } from "./style";

export const screenOptions = ({ route, navigation, theme, ...args }) => {
    return {
        headerStyle: {
            backgroundColor: colors?.background,
            borderBottomWidth: 0,
            shadowOpacity: 0,
            elevation: 0,
        },
        headerTitleStyle: { color: colors?.foreground },
        headerTitleAlign: "center",
        sceneStyle: { backgroundColor: colors.background },
        tabBarItemStyle: { display: "none" },
        tabBarStyle: {
            height: 60,
            backgroundColor: colors?.background,
            borderBottomWidth: 0,
            shadowColor: "transparent",
            shadowOpacity: 0,
            elevation: 0,
            borderTopWidth: 1,
            borderTopColor: transparentMix(0.85),
        },
        tabBarLabelPosition: "below-icon",
        tabBarButton(props) {
            return (
                <Pressable
                    onPress={() => navigation.navigate(route.name)}
                    style={[
                        props.style,
                        { height: "100%", justifyContent: "center", outlineStyle: "none" },
                    ]}
                >
                    {props.children}
                </Pressable>
            );
        },
        tabBarLabel(props) {
            let isFocused = useTabBarFocus(navigation, route);

            return (
                <Text
                    style={{
                        color: tabBarItemColor(isFocused),
                        fontSize: typography.chip.fontSize,
                    }}
                >
                    {props.children}
                </Text>
            );
        },
    };
};
