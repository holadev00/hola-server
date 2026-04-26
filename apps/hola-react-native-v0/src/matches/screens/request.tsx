import { Text, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useMatchesScreensLinks } from "../hooks/useMatchesScreensLinks";
import Button from "@hola/ui/components/Button";
import { useTranslation } from "react-i18next";
import Title, { Subtitle } from "@hola/ui/components/Title";

export function MatchRequestScreen() {
    const { params } = useRoute();
    const { t } = useTranslation();
    const { requestScreen } = useMatchesScreensLinks(params?.venue);
    console.log("Params ...:", params);

    return <View style={{ flex: 1, position: "relative", paddingHorizontal: 16, gap: 12 }}>
        <View style={{ gap: 8 }}>
            <Subtitle>{t("matches.request.match")}</Subtitle>
            <MatchInfo title={t("matches.request.match_title")} value={params?.match} />
            <MatchInfo title={t("matches.request.members")} value={params?.match} />
            <MatchInfo title={t("matches.request.match_title")} value={params?.match} />
        </View>

        <View>
            <Subtitle>{t("matches.request.optional_message")}</Subtitle>
        </View>

        <View style={{ position: "absolute", bottom: 0, left: 16, right: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <Button
                variant={"primary"}
                style={{ flex: 1 }}
                onPress={requestScreen.bind(null, params?.match)}>
                {t("matches.request")}
            </Button>
        </View>
    </View>;
}

function MatchInfo({ title, value }: { title: string; value: string }) {
    return <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <View style={{ height: 50, width: 50, borderWidth: 0, borderColor: "#ccc", borderRadius: 8, backgroundColor: "#ddd" }} />
        <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "bold", color: "#000" }}>{title}</Text>
            <Text style={{ color: "#666" }}>{value}</Text>
        </View>
    </View>
}