import { $TextInput } from "@legendapp/state/react-native";
import { Pressable, View } from "react-native";
import colors, { getTextColor } from "../colors";
import radius from "../radius";
import spacing from "../spacing";
import Color from "colorjs.io";

export default function Input({ style, left, right, top, bottom, control, ...props }: React.ComponentProps<typeof $TextInput>) {
    const background = Color.mix("#888", colors.background, 0.85, { space: "lch", outputSpace: "srgb" }).toString({ format: "hex" });

    const inputStyle = { outlineWidth: 0, color: getTextColor(background) };

    return <Pressable style={{ padding: spacing.md, borderRadius: radius.md, backgroundColor: background, alignItems: "center", justifyContent: "center", flexDirection: "row" }} onPress={() => console.log("press")}>
        <View>
            {left}
        </View>
        <View style={{ flex: 1 }}>
            <View>
                {top}
            </View>
            <$TextInput placeholderTextColor={"#888"} style={[inputStyle, style]} {...props}  />
            <View>
                {bottom}
            </View>
        </View>
        <View>
            {right}
        </View>
    </Pressable>;
}
