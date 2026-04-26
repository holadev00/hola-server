import { Pressable, Text, View } from 'react-native';
import { useSocket } from '@hola/socket';
import { Computed } from '@legendapp/state/react';
import Title from '@hola/ui/components/Title';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '@hola/ui';
import Button from '@hola/ui/components/Button';
import { Feather } from '@expo/vector-icons';
import { language$ } from '../state';

export function Selector({ callback }: { callback?: () => void }) {
    const { t } = useTranslation();
    const socket = useSocket("/");

    const available = [
        "en",
        "es",
        "fr",
    ]

    return <>
        <Title>{t("home.pref.title")}</Title>
        <View style={{ flex: 1, paddingVertical: spacing.sm }}>
            <Computed>
                {() => available.map((lang) => {
                    return <Pressable
                        key={lang}
                        onPress={() => language$.set(lang)}
                        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                    >
                        <Text style={{ paddingVertical: spacing.sm, color: language$.get() === lang ? colors.primary : colors.foreground }}>
                            {t("home.pref.lang." + lang)}
                        </Text>

                        {language$.get() === lang && <Feather name="check" size={16} color={language$.get() ? colors.primary : colors.foreground} />}
                    </Pressable>
                })}
            </Computed>
        </View>
        <Button onPress={async () => {
            await socket.emitWithAck("PREFERENCES/set", {
                language: language$.get(),
            });

            callback?.();
        }}>
            {t("home.pref.continue")}
        </Button>
    </>
}