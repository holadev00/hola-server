import { Switch, Text, View } from "react-native";
import { useVenue } from "../../../contexts/venuesScreen";
import { Computed } from "@legendapp/state/react";
import { useTranslation } from "react-i18next";
import spacing from "@hola/ui/spacing";
import colors from "@hola/ui/colors";
import Title from "@hola/ui/components/Title";

export function ConfidentialitySelector() {
    const { creationInput } = useVenue();
    const { t } = useTranslation();

    return <View style={{ gap: spacing.xs }}>
        <Title>Confidentiality</Title>
        <Computed>
            {() => (
                <View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                        <Text style={{ flex: 1, fontWeight: "500" }}>{creationInput.private.get() ? t("match.private") : t("match.public")}</Text>
                        <Switch value={creationInput.private.get()} onValueChange={creationInput.private.set} />
                    </View>
                    <Text style={{ color: colors.muted }}>
                        {creationInput.private.get() ? t("match.private.desc") : t("match.public.desc")}
                    </Text>
                </View>
            )}
        </Computed>
    </View>;
}