import { KeyboardAvoidingView, Platform, View } from "react-native";
import { useSignInForm } from "../hooks/useSignInForm";
import { useTranslation } from "hola-lang";
import { AuthInput } from "../components/input";
import { Layout } from "../components/Layout";

export function LoginScreen() {
    const { t } = useTranslation();
    const { control, action, fields } = useSignInForm();

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <Layout title={t("home.auth.sign.in.title")} primaryAction={action}>
                <View style={{ gap: 16, paddingTop: 16 }}>
                    {fields.map(field => <AuthInput
                        key={field.name}
                        {...field}
                        control={control}
                    />)}
                </View>
            </Layout>
        </KeyboardAvoidingView>
    );
}



