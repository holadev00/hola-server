import { useVenue } from "../../../contexts/venuesScreen";
import { useMatchesScreensLinks } from "@hola/matches/hooks/useMatchesScreensLinks";
import Button from "@hola/ui/components/Button";
import { useTranslation } from "react-i18next";
import { useRoute } from "@react-navigation/native";

export function MatchCreationScreenPrevButton() {
    const { t } = useTranslation();
    const route = useRoute();
    const venue = useVenue();
    if (!venue) return null;
    const { venueID } = venue;
    const { venueScreen, createScreen } = useMatchesScreensLinks(venueID);

    if (route.name === "CustomerMatchCreationOptions") return <Button style={{ flex: 1 }} onPress={createScreen} variant="secondary">
        {t("matches.back")}
    </Button>

    return <Button style={{ flex: 1 }} onPress={venueScreen} variant="secondary">
        {t("matches.venue")}
    </Button>
}
