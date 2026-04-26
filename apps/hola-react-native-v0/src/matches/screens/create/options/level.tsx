import { Text, View } from "react-native";
import { useVenue } from "../../../contexts/venuesScreen";
import { Computed } from "@legendapp/state/react";
import spacing from "@hola/ui/spacing";
import Button from "@hola/ui/components/Button";
import Title from "@hola/ui/components/Title";
import { useTranslation } from "react-i18next";

const levels = ['beginner', 'intermediate', 'advanced', 'mixed'];

export function LevelSelector() {
    const { creationInput } = useVenue();
    const { t } = useTranslation();

    return <View style={{ gap: spacing.xs }}>
        <Title>Level</Title>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Computed>
                {() => levels.map(level => {
                    return <Button
                        key={level}
                        title={level}
                        variant={creationInput.level.get() === level ? "primary" : "secondary"}
                        onPress={() => creationInput.level.set(
                            creationInput.level.get() === level ?
                                null :
                                level
                        )}>
                        <Text style={{ fontWeight: 400 }}>{t(`match.level.${level}`)}</Text>
                    </Button>;
                })}
            </Computed>
        </View>
    </View>;
}