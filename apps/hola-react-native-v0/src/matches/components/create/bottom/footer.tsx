import { View } from "react-native";
import { Computed } from "@legendapp/state/react";
import spacing from "@hola/ui/spacing";
import { MatchCreationScreenPrevButton } from "./prev";
import { MatchCreationScreenNextButton } from "./next";

export function MatchCreationScreenFooter() {
    return <Computed>
        {() => {
            return <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.md }}>
                <MatchCreationScreenPrevButton />
                <MatchCreationScreenNextButton />
            </View>
        }}
    </Computed>
}