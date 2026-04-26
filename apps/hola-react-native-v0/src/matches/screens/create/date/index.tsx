import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useVenue } from "../../../contexts/venuesScreen";
import { useEffect, useState } from "react";
import { Computed, use$, useObserveEffect } from "@legendapp/state/react";
import { Calendar } from "../../../components/create/calendar";
import { bottomHeight, currentDay } from "../state";
import { useTranslation } from "react-i18next";
import { SlotSelector } from "../../../components/create/slots/components/selector";
import spacing from "@hola/ui/spacing";
import { MatchCreationScreenBottom } from "../../../components/create/bottom";
import Title from "@hola/ui/components/Title";
import { Picker } from '@react-native-picker/picker';
import { colors, radius } from "@hola/ui";
import { observable } from "@legendapp/state";

const ratio$ = observable(1);
export function MatchCreationScreen() {
    const { t } = useTranslation();
    const venue = useVenue();
    const [{ width, height }, setLayout] = useState({ width: 1, height: 1 });
    const [sports, setSports] = useState([]);

    useEffect(() => {
        setSports(
            Object.values(venue?.availabilities ?? {})?.flatMap(c => c).map(a => a?.court?.sport).filter((v, i, a) => a.indexOf(v) === i)
        );
    }, [venue]);

    const settings = [
        {
            key: 'sport',
            label: 'matches.creation.settings.sport.label',
            type: 'select',
            options: sports.map(s => ({ value: s, label: t(`sports.${s}`) })),
        },
        {
            key: 'filmed',
            label: 'matches.creation.settings.filmed.label',
            type: 'select',
            options: [
                { value: true, label: 'matches.creation.settings.filmed.options.yes' },
                { value: null, label: 'matches.creation.settings.filmed.options.unknown', default: true },
                { value: false, label: 'matches.creation.settings.filmed.options.no' }
            ],
        },
        {
            key: 'indoor',
            label: 'matches.creation.settings.indoor.label',
            type: 'select',
            options: [
                { value: true, label: 'matches.creation.settings.indoor.options.yes' },
                { value: null, label: 'matches.creation.settings.indoor.options.unknown', default: true },
                { value: false, label: 'matches.creation.settings.indoor.options.no' }
            ],
        }
    ]

    useEffect(() => {
        if (width <= 1 || height <= 1) return;
        ratio$.set(Number((width / height).toFixed(2)));
    }, [width, height]);

    useObserveEffect(ratio$, () => {
        console.log(ratio$.get());
    });

    return <Computed>
        {() => {
            const ratio = ratio$.get();
            const breakpoints = [
                0.7,
                1
            ]

            return <View style={{ position: "relative", flex: 1, paddingHorizontal: spacing.lg, gap: spacing.lg }} onLayout={(e) => e.nativeEvent.layout && setLayout(e.nativeEvent.layout)}>
                <View style={{ flex: 1, gap: spacing.lg, flexDirection: (ratio >= breakpoints[1]) ? "row" : "column" }}>
                    <View style={{ columnGap: spacing.xl, rowGap: spacing.md, flexDirection: "row", alignItems: "flex-start", overflow: "hidden", flex: ratio >= breakpoints[1] ? 1 : undefined }}>
                        {ratio >= breakpoints[0] && <View style={{ width: "100%", maxWidth: (ratio >= 1.7) ? undefined : (ratio >= breakpoints[0] && ratio < breakpoints[1]) ? '50%' : height - 150 }}>
                            <Calendar />
                        </View>}
                        {(ratio >= breakpoints[0] && ratio < breakpoints[1]) && <SettingsSection />}
                    </View>
                    {ratio >= 1.7 && <SettingsSection />}
                    <ScrollView style={{ flex: 1, height: "100%" }} contentContainerStyle={{ gap: spacing.md, alignItems: "stretch" }}>
                        {ratio < breakpoints[0] && <View style={{ width: "100%" }}>
                            <Calendar />
                        </View>}
                        {ratio < breakpoints[0] && <SettingsSection />}
                        {(ratio >= breakpoints[1] && ratio < 1.7) && <SettingsSection />}
                        <Title>{t("matches.creation.slots")}</Title>
                        {venue?.availabilities?.[venue?.daysFromNow]?.length > 0 ?
                            <SlotSelector
                                availabilities={venue?.availabilities}
                                daysFromNow={venue.daysFromNow}
                                creationInput={venue?.creationInput} /> :
                            <View style={{ padding: spacing.md, gap: spacing.md }}>
                                <Text style={{ fontWeight: "600" }}>
                                    Aucun créneau disponible
                                </Text>
                            </View>}
                        <View style={{ height: bottomHeight.get() }} />
                    </ScrollView>
                </View>

                <MatchCreationScreenBottom />
            </View>
        }}
    </Computed>;

    function SettingsSection() {
        return  <View style={{ flex: 1 }}>
            <Title>{t("matches.creation.filters")}</Title>
            <Settings settings={settings} />
        </View>;
    }
}

function Settings({ settings }) {
    const { t } = useTranslation();
    const venue = useVenue();
    if (!settings || !venue) return null;

    return <View style={{ padding: spacing.md, gap: spacing.md }}>
        {settings.map((setting, index) => {
            return <View key={index} style={{ gap: spacing.xs }}>
                <Text style={{ fontWeight: "600" }}>
                    {t(setting.label)}
                </Text>
                <Computed>
                    {() => {
                        return <Picker
                            style={{ width: "100%", padding: spacing.md, backgroundColor: colors.subtle, borderRadius: radius.md, outlineStyle: "none", border: "none" }}
                            selectedValue={venue?.settings?.[setting.key].get() || String(setting.options.find(o => o.default)?.value)}
                            onValueChange={(value) => venue?.settings?.[setting.key].set(value)}>
                            {setting.options.map((option, index) => {
                                return <Picker.Item key={index} label={t(option.label)} value={String(option.value)} />
                            })}
                        </Picker>
                    }}
                </Computed>
            </View>;
        })}
    </View>
}