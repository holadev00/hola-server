import { Layout } from "hola-ui";
import { AvailableLangsSelector, language, useTranslation } from "hola-lang";
import { useNavigation } from "@react-navigation/native";
import { onboarding$ } from "../../states/onboarding";
import { useEffect } from "react";

export function OnboardingLangScreen() {
    const { t } = useTranslation();
    const { navigate } = useNavigation();

    const action = {
        label: t("home.lang.continue"),
        onPress: () => {
            onboarding$.lang.set(language.get());
            navigate("CustomerAuthOnboardingPreferences");
        },
    };

    useEffect(() => {
        onboarding$.screen.set("Language");
    }, []);

    return <Layout
        title={t("home.lang.title")}
        primaryAction={action}
    >
        <AvailableLangsSelector />
    </Layout>
}