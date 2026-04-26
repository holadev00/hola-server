import { Pressable, ScrollView, Text, View } from "react-native";
import { Link, useNavigation, useRoute } from "@react-navigation/native";
import { useVenue } from "../contexts/venuesScreen";
import { useEffect } from "react";
import Button from "@hola/ui/components/Button";
import { useMatchesScreensLinks } from "../hooks/useMatchesScreensLinks";
import { Computed } from "@legendapp/state/react";
import radius from "@hola/ui/radius";
import colors from "@hola/ui/colors";
import moment from "moment";
import { Entypo, Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import spacing from "@hola/ui/spacing";
import { useTranslation } from "hola-lang";

export function MatchesByVenueScreen() {
    const venue = useVenue();
    const { t } = useTranslation();
    if (!venue) return null;

    const { getVenueMatches, venueID, matches } = venue;
    const { createScreen, detailsScreen } = useMatchesScreensLinks(venueID);

    useEffect(function () {
        const off = getVenueMatches();
        return off;
    }, [venueID]);

    return <View style={{ flex: 1, paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
        <View style={{ position: "relative", flex: 1, gap: spacing.md }}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 12 }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.primary }}>
                    {t("matches.upcomingMatches")}
                </Text>

                <Computed>
                    {() => matches?.length === 0 ? <Text>{t("matches.noMatches")}</Text> : matches?.sort((a, b) => {
                        return moment(a.date).add(a.start * 60, "minutes").valueOf() - moment(b.date).add(b.start * 60, "minutes").valueOf();
                    })?.map((match, index) => {
                        const base = moment(match.date).add(match.start * 60, "minutes");
                        return <Pressable key={index} style={{ flexDirection: "row", gap: 12, padding: 12, width: "100%", borderWidth: 1, borderColor: `${colors.muted}88`, borderRadius: radius.md }} onPress={() => detailsScreen(match._id)}>
                            <View style={{ width: 30, alignItems: "center", justifyContent: "start", borderRadius: radius.sm, aspectRatio: 1 }}>
                                <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.primary }}>
                                    {match.court.sport === "football" && <Ionicons name="football" size={36} color={colors.primary} />}
                                </Text>
                            </View>
                            <View style={{ flex: 1, gap: spacing.xs }}>
                                <View>
                                    <Text style={{ fontWeight: "bold", color: colors.primary }}>
                                        {base.format("DD MMM YYYY - HH:mm")}
                                        {match.private && <Entypo name="lock" size={14} color={colors.primary} style={{ marginLeft: 4 }} />}
                                    </Text>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                        {(match.court.name || match.court.filmed) && <>
                                            <Text style={{ fontWeight: "bold", color: colors.muted }}>
                                                {match.court.name}
                                                {match.court.filmed && <> 🎥</>}
                                            </Text>
                                            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.muted }} />
                                        </>}
                                        <Text style={{ fontWeight: "bold", color: colors.muted }}>{t("matches.level", { level: match.level })}</Text>
                                    </View>
                                    {match.description && <Text style={{ color: colors.muted }}>{match.description}</Text>}
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, }}>
                                    {match?.participations.map((_, i) => {
                                        return <View key={i} style={{ width: spacing.xxl, aspectRatio: 1, borderRadius: radius.pill, padding: spacing.xxs, backgroundColor: colors.background, transform: [{ translateX: i * -spacing.md }] }}>
                                            <View style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: colors.muted, borderRadius: radius.pill, overflow: "hidden" }}>
                                                <MaterialCommunityIcons key={i} name="account" size={20} color={colors.background} style={{ alignSelf: "center" }} />
                                            </View>
                                        </View>;
                                    })}
                                </View>
                            </View>
                        </Pressable>;
                    })}
                </Computed>
            </ScrollView>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <Button style={{ flex: 1 }} onPress={createScreen}>
                    {t("matches.create")}
                </Button>
            </View>
        </View>
    </View>;
}