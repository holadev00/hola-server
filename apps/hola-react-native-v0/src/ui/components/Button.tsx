import { useState, useEffect } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import spacing from "../spacing";
import typography from "../typography";
import uiColors from "../colors";
import radius from "../radius";
import borders from "../borders";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Color from "colorjs.io";
import invert from "invert-color";

function Button({
    children,
    variant = "primary", // 'primary' | 'secondary' | 'chip'
    onPress,
    disabled = false,
    style,
    ...props
}: {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "chip";
    onPress?: () => void;
    disabled?: boolean;
    style?: any;
    [key: string]: any;
}) {
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    const hoverDetector = Gesture.Hover()
        .runOnJS(true)
        .onBegin(() => {
            setHovered(true);
        })
        .onUpdate(() => { })
        .onEnd(() => {
            setHovered(false);
        });

    function resolveButtonBackgroundColor(color: string, text?: boolean) {
        const contrast = Color.contrast(color, "white", "WCAG21") >= 4.5 ? "white" : "black";
        return Color.mix(
            disabled ? uiColors.disabledPrimary : color,
            contrast,
            hovered ? 0.05 : pressed ? 0.1 : 0,
            { space: "lch", outputSpace: "srgb" }
        ).toString({ format: "hex" })
    }

    function resolveButtonTextColor(color: string) {
        return invert((new Color(color)).to("srgb").toString({ format: "hex" }), { black: "#000", white: "#FFF", threshold: 0.5 });
    }

    return (
        <GestureDetector gesture={hoverDetector}>
            <Pressable
                onPress={disabled ? null : onPress}
                style={({ pressed }) => [
                    styles.base,
                    variant === "primary" && [
                        {
                            backgroundColor: resolveButtonBackgroundColor(uiColors.primary),
                            borderRadius: radius.lg
                        }
                    ],
                    variant === "secondary" && [
                        {
                            backgroundColor: disabled
                                ? uiColors.disabledBackground
                                : uiColors.background,
                            borderWidth: 1,
                            borderColor: borders.color,
                            borderRadius: radius.lg
                        }
                    ],
                    variant === "chip" && [
                        {
                            backgroundColor: disabled
                                ? uiColors.disabledBackground
                                : uiColors.accent,
                            borderRadius: 999,
                            paddingVertical: spacing.chipPaddingY,
                            paddingHorizontal: spacing.chipPaddingX
                        }
                    ],
                    style
                ]}
                {...props}
                android_ripple={{ color: "#ccc" }}
                accessibilityState={{ disabled }}
            >
                <Text
                    numberOfLines={1}
                    style={[
                        styles.text,
                        variant !== "chip" && { color: resolveButtonTextColor(uiColors?.[variant]), fontWeight: typography.button.fontWeight },
                        variant === "chip" && { color: uiColors.textPrimary, fontWeight: typography.chip.fontWeight }
                    ]}
                >
                    {children}
                </Text>
            </Pressable>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    base: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.buttonPaddingX,
        paddingVertical: spacing.buttonPaddingY
    },
    text: {
        fontSize: typography.button.fontSize,
    }
});

export default Button;
