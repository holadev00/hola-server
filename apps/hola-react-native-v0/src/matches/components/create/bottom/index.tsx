import { View } from "react-native";
import { useTranslation } from "react-i18next";
import spacing from "@hola/ui/spacing";
import { bottomHeight } from "../../../screens/create/state";
import { MatchCreationScreenPanel } from "./panel";
import { MatchCreationScreenFooter } from "./footer";

export function MatchCreationScreenBottom() {
    const { t } = useTranslation();

    function layoutBottom({ nativeEvent }) {
        bottomHeight.set(nativeEvent.layout.height);
    }

    return <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: spacing.md, gap: spacing.md }} onLayout={layoutBottom}>
        <MatchCreationScreenPanel />
        <MatchCreationScreenFooter />
    </View>;
}