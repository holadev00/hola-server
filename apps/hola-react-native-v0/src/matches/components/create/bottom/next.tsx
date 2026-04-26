import { useVenue } from "../../../contexts/venuesScreen";
import { useMatchesScreensLinks } from "@hola/matches/hooks/useMatchesScreensLinks";
import { Computed } from "@legendapp/state/react";
import Button from "@hola/ui/components/Button";
import { useTranslation } from "react-i18next";
import { useRoute } from "@react-navigation/core";
import { appHotToast, appLoading } from "../../../../overlays";

export function MatchCreationScreenNextButton() {
    const { t } = useTranslation();
    const route = useRoute();
    const venue = useVenue();

    if (!venue) return null;
    const { venueID, creationInput, setMatch } = venue;
    const { createOptionsScreen, createCheckoutScreen, venueScreen } = useMatchesScreensLinks(venueID);

    async function createMatch() {
        appLoading.set(true);
        const { ok } = await setMatch();

        if (ok) appHotToast.push({
            date: Date.now(),
            title: t("matches.created"),
            message: t("matches.created"),
            type: "success",
            duration: 3000
        }); else appHotToast.push({
            date: Date.now(),
            title: t("matches.error"),
            message: t("matches.error"),
            type: "error",
            duration: 3000
        });


        setTimeout(() => {
            appLoading.set(false);
            creationInput.set(null);
            if (ok) venueScreen();
        }, 3000);
    }

    return <Computed>
        {() => {
            if (route.name === "CustomerMatchCreationCheckout") return <Button style={{ flex: 1 }} onPress={createMatch}>
                {t("matches.create")}
            </Button>

            if (route.name === "CustomerMatchCreationOptions") return creationInput.level.get() && <Button style={{ flex: 1 }} onPress={createCheckoutScreen}>
                {t("matches.create")}
            </Button>

            return creationInput.selectedAvailability.get() && <Button style={{ flex: 1 }} onPress={createOptionsScreen}>
                {t("matches.create")}
            </Button>
        }}
    </Computed>
}