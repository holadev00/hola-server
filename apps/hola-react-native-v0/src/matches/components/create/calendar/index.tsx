import { View } from "react-native";
import { CalendarHeader } from "./header";
import { CalendarBody } from "./body";
import { colors, spacing } from "@hola/ui";

export function Calendar() {
    return (
        <View style={{ justifyContent: "center", alignItems: "flex-start"  }}>
            <View style={{ width: "100%", height: "100%", backgroundColor: colors.subtle, padding: spacing.md, borderRadius: spacing.md }}>
                <CalendarHeader />
                <CalendarBody />
            </View>
        </View>
    );
}