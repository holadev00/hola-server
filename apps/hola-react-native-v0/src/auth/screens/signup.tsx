import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Layout } from "hola-ui";
import { AuthInput } from "../components/input";
import { useSignUpForm } from "../hooks/useSignUpForm";
import { useTranslation } from "hola-lang";
import { useEffect } from "react";
import { onboarding$ } from "../states/onboarding";
import { useNavigation } from "@react-navigation/native";

export function SignUpScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { control, action, fields } = useSignUpForm({
        onSuccess: () => {
            navigation.navigate("CustomerAuthOnboardingProfile");
        }
    });

    useEffect(() => {
        onboarding$.screen.set("SignUp");
    }, []);

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <Layout title={t("home.auth.sign.up.title")} primaryAction={action}>
                <View style={{ gap: 16, paddingTop: 16 }}>
                    {fields.map(field => <AuthInput
                        key={field.name}
                        {...field}
                        control={control}
                        action={action?.onPress}
                    />)}
                </View>
            </Layout>
        </KeyboardAvoidingView>

    );
}