import { colors } from "@hola/ui";
import Color from "colorjs.io";

export const transparentMix = (o) => Color.mix(colors?.foreground, "transparent", o, {
        space: "lch",
        outputSpace: "srgb",
    }).toString({ format: "hex" });

export const tabBarItemColor = (isFocused) => {
    return isFocused
        ? colors?.primary
        : transparentMix(0.6);
};
