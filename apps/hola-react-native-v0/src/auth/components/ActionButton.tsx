import invert from "invert-color";
import { Pressable, Text } from "react-native";
import Color from "colorjs.io";
import { styles } from "../styles";

export function ActionButton({ color = "blue", title, style, ...props }: { color?: string; title?: string; style?: any; [key: string]: any }) {
    const hexColor = new Color(color).toString({ format: "hex" }).substring(0, 7);
    const textColor = invert(hexColor, { black: "#000", white: "#fff", threshold: 0.5 });

    return (
        <Pressable style={[styles.actionButton, style, { backgroundColor: color }]} {...props}>
            <Text style={[styles.actionButtonText, { color: textColor }]} numberOfLines={1}>
                {title || "Press me"}
            </Text>
        </Pressable>
    );
}
