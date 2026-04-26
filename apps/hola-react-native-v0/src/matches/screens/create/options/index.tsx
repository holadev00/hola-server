import { ScrollView, View } from "react-native";
import { useVenue } from "../../../contexts/venuesScreen";
import { useEffect } from "react";
import { Computed, use$ } from "@legendapp/state/react";
import { currentDay } from "../state";
import { useTranslation } from "react-i18next";
import { MatchCreationScreenBottom } from "../../../components/create/bottom";
import { useMatchesScreensLinks } from "@hola/matches/hooks/useMatchesScreensLinks";
import Input from "@hola/ui/components/Input";
import { LevelSelector } from "./level";
import { ConfidentialitySelector } from "./confidentiality";
import { spacing } from "@hola/ui";

export function MatchCreationOptionScreen() {
    const { t } = useTranslation();
    const { getAvailabilities, creationInput, venueID } = useVenue();
    const { createScreen, indexScreen } = useMatchesScreensLinks(venueID);

    const daysFromNow = use$(currentDay);
    useEffect(function () {
        const off = getAvailabilities(daysFromNow);

        return off;
    }, [daysFromNow]);

    useEffect(function () {
        console.log("MatchCreationOptionScreen", venueID, creationInput.selectedAvailability.get());

        if (!venueID) {
            indexScreen();
            return;
        }

        if (!creationInput.selectedAvailability.get()) {
            createScreen();
            return;
        }
    }, [venueID]);

    return <Computed>
        {() => {
            return <View style={{ position: "relative", flex: 1, paddingHorizontal: spacing.lg }}>
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 12 }}>
                    <Input
                        placeholder={t(`matches.description.add`)}
                        numberOfLines={5}
                        multiline
                        $value={creationInput?.description} />
                    <LevelSelector />
                    <ConfidentialitySelector />
                </ScrollView>

                <MatchCreationScreenBottom />
            </View>
        }}
    </Computed>;
}