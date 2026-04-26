import { useTranslation } from "hola-lang";
import { Layout } from "hola-ui";
import { Pressable, Text, View } from "react-native";
import { observable } from "@legendapp/state";
import { Computed } from "@legendapp/state/react";
import { useNavigation } from "@react-navigation/native";
import { onboarding$ } from "../../states/onboarding";
import { useEffect } from "react";

const levelValues = [ "beginner", "intermediate", "advanced" ];
const positionValues = [ "striker", "midfielder", "defender", "goalkeeper" ];
const sportsValues = ["football", "basketball", "tennis", "volleyball"];
const preferences = observable({
    level: levelValues[0],
    position: positionValues[0],
});

export function OnboardingPrefScreen() {
    const { t } = useTranslation();
    const { navigate } = useNavigation();

    const action = {
        label: t("home.pref.continue"),
        onPress: () => {
            onboarding$.preferences.set(preferences.get());
            navigate('CustomerAuthOnboardingConfidentiality');
        },
    };

    useEffect(() => {
        onboarding$.screen.set("Preferences");
    }, []);

    return <Layout title={t("home.pref.title")} primaryAction={action}>
        <View style={{ gap: 16 }}>
            <Section section={"level"} title={t("home.pref.level")} values={levelValues} />
            {/* <Section section={"position"} title={t("home.pref.position")} values={positionValues} /> */}
            <Section section={"sport"} title={t("home.pref.sport")} values={sportsValues} />
        </View>
    </Layout>
}

function Section({ title, values, section }: { title: string }) {
    return <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: "500", fontSize: 18 }}>{title}</Text>
        <View style={{ flexDirection: "row", flexWrap: "nowrap", gap: 8 }}>
            {values.map((value) => <Value key={value} label={value} section={section} />)}
        </View>
    </View>;
}

function Value ({ label, section }: { label: string }) {
    const { t } = useTranslation();
    return <Computed>
        {() => <Pressable style={{ borderColor: label === preferences.get()?.[section] ? "#000" : "#0002", borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 }} onPress={() => preferences?.[section].set(label)}>
            <Text>{t(label)}</Text>
        </Pressable>}
    </Computed>
}