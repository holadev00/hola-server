import { Text, View } from "react-native";
import { useVenue } from "../../../contexts/venuesScreen";
import { Computed } from "@legendapp/state/react";
import moment from "moment";
import colors, { getTextColor } from "@hola/ui/colors";
import Color from "colorjs.io";
import { useTranslation } from "react-i18next";
import { sportIcon } from "../../sportIcon";

export function MatchCreationScreenPanel() {
    const venue = useVenue();
    const { t } = useTranslation();

    if (!venue) return null;

    const { creationInput } = venue;

    return (
        <Computed>
            {() => {
                const color = getTextColor(colors.primary);
                const selected = creationInput.selectedAvailability.get();

                if (!selected) return null;

                const slotDuration = moment()
                    .startOf("day")
                    .add(selected.slot * 60, "minutes");

                return (<View style={{ padding: 16, backgroundColor: colors.primary, borderRadius: 6, flexDirection: "row", alignItems: "center", gap: 16 }}>
                    {sportIcon(32, color, selected.court.sport)}
                    <View>
                        <Text style={{ fontWeight: "600", color }}>
                            Créneau sélectionné
                        </Text>

                        <View style={{ flexDirection: "row", gap: 4 }}>
                            <Text style={{ color }}>{moment(selected.date).format("dddd")}</Text>
                            <Text style={{ color }}>·</Text>
                            <Text style={{ color }}>{moment(selected.date).format("DD/MM/YYYY")}</Text>
                            <Text style={{ color }}>·</Text>
                            <Text style={{ color }}>
                                {moment().startOf("day").add(selected.start, "minutes").format("HH:mm")}
                                {" → "}
                                {moment().startOf("day").add(selected.end, "minutes").format("HH:mm")}
                            </Text>
                        </View>

                        {creationInput.level.get() && (
                            <Text style={{ color }}>
                                Niveau : {creationInput.level.get()}
                            </Text>
                        )}

                        {creationInput.private.get() !== undefined && <Text style={{ color }}>
                            {creationInput.private.get()
                                ? t("match.private")
                                : t("match.public")}
                        </Text>}
                    </View>
                </View>);
            }}
        </Computed>
    );
}
