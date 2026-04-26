import React, { useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Text, View } from "react-native";
import Title, { Subtitle } from "@hola/ui/components/Title";
import { useTranslation } from "react-i18next";
import moment from "moment";
import 'moment/locale/es'
import 'moment/locale/fr'
import 'moment/locale/pt'
import 'moment/locale/en-gb'
import colors from "@hola/ui/colors";
import radius from "@hola/ui/radius";
import spacing from "@hola/ui/spacing";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from "@hola/ui/components/Button";
import { useMatchesScreensLinks } from "../hooks/useMatchesScreensLinks";
import { useSocket } from "@hola/socket";

export function MatchDetailsScreen() {
    const socket = useSocket("/");

    const { t } = useTranslation();
    const [{
        court,
        venue,
        location,
        images,
        createdBy,
        date,
        start,
        end,
        level,
        participations,
        description,
        private: _private,
        active,
    }, setDetails] = useState({});
    const [address, setAddress] = useState<string | null>(null);
    const { params } = useRoute();
    const { goBack, navigate } = useNavigation();
    const { requestScreen } = useMatchesScreensLinks(venue?.id);
    const isPart = participations?.some(p => p.self);

    useEffect(function () {
        const emit = () => socket.emit("VENUES/match/details", params?.match, setDetails);

        socket.on("VENUES/match/details", setDetails);
        emit();

        socket.on("connect", emit);

        return () => {
            socket.off("connect", emit);
            socket.off("VENUES/match/details", setDetails);
        }
    }, [params?.match]);

    useEffect(() => {
        if (params?.match == null) {
            return goBack();
        }
    }, []);

    useEffect(() => {
        if (!location?.coordinates) return;
        socket.emit(
            "LOCATIONS/geocode/reverse",
            {
                lat: location.coordinates[1],
                lng: location.coordinates[0]
            },
            ({ address }) => setAddress(address)
        );
    }, [location]);

    const dateMoment = moment(date);
    dateMoment.locale("fr");

    return <View style={{ flex: 1, gap: 12, position: "relative" }}>
        <View style={{ height: 200, backgroundColor: "#ccc" }} />
        <View style={{ paddingHorizontal: 16, flex: 1, gap: 6, position: "relative" }}>
            <Title>{t(`matches.details.${court?.sport}.title`)}</Title>
            <View>
                <Text style={{ fontWeight: "bold", color: colors.muted }}>{t(`matches.details.description`)}</Text>
                <Text style={{ color: colors.muted, fontStyle: "italic" }}>{description}</Text>
            </View>
            <Text style={{ color: colors.muted }}>
                {dateMoment.format("dddd, LL")}
                {dateMoment.clone().add(start * 60, "minutes").format(" - LT")}
                {dateMoment.clone().add(end * 60, "minutes").format(" - LT")}
            </Text>
            <Text style={{ color: colors.muted }}>{venue?.name}, {address?.municipality}, {address?.country}</Text>
            <Subtitle>{t(`matches.details.players`)}</Subtitle>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, }}>
                {participations?.map((_, i) => {
                    return <View key={i} style={{ width: spacing.xxl, aspectRatio: 1, borderRadius: radius.pill, padding: spacing.xxs, backgroundColor: colors.background, transform: [{ translateX: i * -spacing.md }] }}>
                        <View style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: colors.muted, borderRadius: radius.pill, overflow: "hidden" }}>
                            <MaterialCommunityIcons key={i} name="account" size={20} color={colors.background} style={{ alignSelf: "center" }} />
                        </View>
                    </View>;
                })}
            </View>
        </View>

        <View style={{ position: "absolute", bottom: 0, left: 16, right: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <Button
                variant={isPart ? "secondary" : "primary"}
                style={{ flex: 1 }}
                disabled={isPart}
                onPress={isPart ? undefined : requestScreen.bind(null, params?.match)}>
                {isPart ? t("matches.joined") : t("matches.join")}
            </Button>
        </View>
    </View>;
}