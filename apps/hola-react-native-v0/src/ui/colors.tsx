import invert from "invert-color";
import Color from "colorjs.io";

export let colors = {
    primary: "#FF5A1F",
    accent: "#FFE18D",
    secondary: "#6ECFF6",
    background: "#fff", //"#FFF9F4",
    textPrimary: "#333333",
    disabledPrimary: "#f2a38a",
    disabledBackground: "#f5f5f5",
    success: "#4CAF50",
    error: "#f00",
}

colors.muted = Color.mix("#888", colors.background, 0.55, { space: "lch", outputSpace: "srgb" }).toString({ format: "hex" });
colors.subtle = Color.mix("#888", colors.background, 0.9, { space: "lch", outputSpace: "srgb" }).toString({ format: "hex" });
colors.foreground = invert(colors.background, { black: "#000", white: "#FFF", threshold: 0.5 });
colors.opacity = Color.mix(colors.foreground, "transparent", 0.95, { space: "lch", outputSpace: "srgb" }).toString({ format: "hex" });

export function getTextColor(color: string) {
    return invert(color, { black: "#000", white: "#FFF", threshold: 0.5 });
}

export default colors as {
    primary: string;
    accent: string;
    secondary: string;
    background: string;
    textPrimary: string;
    disabledPrimary: string;
    disabledBackground: string;
    success: string;
    error: string;
    muted: string;
    subtle: string;
    foreground: string;
}