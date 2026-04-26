import { useNavigation } from "@react-navigation/native";
import { useForm } from "react-hook-form";
import { defaultValues } from "../states/forms";
import { useTranslation } from "hola-lang";
import { useSocket } from "@hola/socket";
import { useMobileLayout } from "@hola/navigation/hooks/useMobileLayout";

export function useSignInForm() {
    const socket = useSocket("/");
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { mobile } = useMobileLayout();

    const { control, formState: { isValid, touchedFields }, getValues } = useForm({
        defaultValues: defaultValues.get(),
    });

    const action = touchedFields && isValid && {
        label: t("home.auth.sign.in.submit"),
        onPress: () => {
            const values = getValues();
            socket.emit('AUTH/login', values, res => {
                if (res.success) {
                    if (!mobile) navigation.navigate("CustomerMatches");
                    else navigation.navigate("CustomerHome");
                } else {
                    alert(JSON.stringify({res}, null, 2));
                    //return addNotification({ title: "Error", message: res.error });
                }
            });
        },
    };

    const fields = [
        { name: "identifiant", },
        { name: "password", secureTextEntry: true }
    ];

    return { control, action, fields };
}
