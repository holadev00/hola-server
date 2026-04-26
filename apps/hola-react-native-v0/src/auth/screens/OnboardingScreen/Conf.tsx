import { View, Text, Switch } from "react-native";
import { Layout } from "hola-ui";
import { useTranslation } from "hola-lang";
import { observable } from "@legendapp/state";
import { Computed } from "@legendapp/state/react";
import { useNavigation } from "@react-navigation/native";
import { onboarding$ } from "../../states/onboarding";
import { useEffect } from "react";
import { useSocket } from "@hola/socket";

const _private = observable(true);

export function OnboardingConfScreen() {
    const { t } = useTranslation();
    const { navigate } = useNavigation();
    const socket = useSocket("/");

    const action = {
        label: t("home.conf.continue"),
        onPress: () => {
            onboarding$.private.set(_private.get());
            socket.emit('AUTH/signup/register', onboarding$.get(), res => {
                if (res.success) {
                    navigate("CustomerAuthOnboardingTutorial");
                } else {
                    alert(JSON.stringify({ res }, null, 2));
                }
            });
        },
    };

    useEffect(() => {
        onboarding$.screen.set("Confidentiality");
    }, []);

    return (
        <Layout title={t("home.conf.title")} primaryAction={action}>
            <Computed>
                {() => {
                    const privateValue = _private.get();
                    const keyWord = `home.conf.${privateValue ? "private" : "public"}`;
                    return <View style={{ gap: 16 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: "500" }}>{t(`${keyWord}.title`)}</Text>
                                <Text style={{ color: "#bbb" }}>{t(`${keyWord}_desc_status`)}</Text>
                            </View>
                            <Switch value={_private.get()} onValueChange={_private.set} />
                        </View>
                        <Text>{t(`${keyWord}_desc`)}</Text>
                    </View>
                }}
            </Computed>
        </Layout>
    );
}