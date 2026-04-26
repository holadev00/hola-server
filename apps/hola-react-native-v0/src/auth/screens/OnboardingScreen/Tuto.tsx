import { View, Text, Pressable } from "react-native";
import { Layout } from "hola-ui";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "hola-lang";
import { useEffect, useState } from "react";
import { onboarding$ } from "../../states/onboarding";
import { useMobileLayout } from "@hola/navigation/hooks/useMobileLayout";
import { useSocket } from "@hola/socket";

export function OnboardingTutoScreen() {
    const { t } = useTranslation();
    const { navigate } = useNavigation();
    const [step, setStep] = useState(0);
    const { mobile } = useMobileLayout();
    const socket = useSocket("/");

    const action = {
        label: t("home.tuto.next"),
        onPress: () => {
            if (step < 2) return setStep(s => s + 1);
            socket.emit('AUTH/signup/onBoardingEnd', res => {
                if (res.success) {
                    if (!mobile) navigate("CustomerMatches");
                    else navigate("CustomerHome");
                }
            });
        },
    }

    useEffect(() => {
        onboarding$.screen.set("Tutorial");
    }, []);

    return <Layout header={false} primaryAction={action}>
        <View style={{ flex: 1, alignItems: "flex-end", justifyContent: "center" }}>
            <Pressable onPress={() => {
                setStep(2);
                action.onPress();
            }} style={{ padding: 12 }}>
                <Text>Skip</Text>
            </Pressable>
        </View>

        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, flexDirection: "row", padding: 16 }}>
            {Array.from({ length: 3 }).map((_, index) => <Pressable key={index} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: index === step ? "#000" : "#ccc" }} onPress={() => setStep(index)} />)}
        </View>

        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: "600" }}>{t(`home.tuto.step.${step}.title`)}</Text>
            <Text style={{}}>{t(`home.tuto.step.${step}.desc`)}</Text>
        </View>
    </Layout>
}