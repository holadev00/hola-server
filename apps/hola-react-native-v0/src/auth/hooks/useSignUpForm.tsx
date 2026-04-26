import { useNavigation } from "@react-navigation/core";
import { useForm } from "react-hook-form";
import { defaultValues } from "../states/forms";
import { useTranslation } from "hola-lang";
import { onboarding$ } from "../states/onboarding";
import { useSocket } from "@hola/socket";

export function useSignUpForm({ onSuccess }: { onSuccess: () => void }) {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const socket = useSocket("/");

    const { control, formState: { isValid, touchedFields }, getValues } = useForm({
        defaultValues: defaultValues.get(),
    });

    const action = touchedFields && isValid && {
        label: t("home.auth.sign.up.submit"),
        onPress: () => {
            const values = getValues();
            onboarding$.user.set(values);
            socket.emit('AUTH/signup/validate', values, res => {
                if (res.success) {
                    return onSuccess();
                }
                else {
                    alert(JSON.stringify(res.error, null, 2));
                }
            });
        },
    };

    const fields = [
        { name: "username" },
        { name: "email", keyboardType: "email-address" },
        { name: "phone", keyboardType: "phone-pad" },
        { name: "password", secureTextEntry: true },
        { name: "password_confirm", secureTextEntry: true },
    ];

    return { control, action, fields };
}
