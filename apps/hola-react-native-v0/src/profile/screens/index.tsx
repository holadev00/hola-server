import { useSocket } from "@hola/socket";
import { colors, radius, spacing } from "@hola/ui";
import { Computed, useObservable } from "@legendapp/state/react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import Button from "@hola/ui/components/Button";
import { useTranslation } from "hola-lang";
import { createSocketGetter } from "@hola/socket/functions/createSocketGetter";
import Title from "@hola/ui/components/Title";
import { Image } from "expo-image";

export function ProfileScreen() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const { params } = useRoute();
    const socket = useSocket("/");
    const profile = useObservable({});

    useEffect(() => {
        const unsubscribe = createSocketGetter({
            socket,
            event: "PROFILE/get",
            args: [params?.id ?? null],
            setter: data => profile.set(data),
        });

        return () => unsubscribe();
    }, [params?.id]);

    return <>
        <Computed>
            {() => {
                if (!profile?.get()) return null;

                console.log(profile?.get());
                if (profile?.get()?.found === false || profile?.get()?.error) {
                    navigation.navigate('CustomerHome');

                    return <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
                        <Text>{t("profile.notfound")}</Text>
                    </View>;
                }

                if (profile?.get()?.authenticated === false) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
                    <Text>{t("profile.unauthenticated")}</Text>
                    <Button onPress={() => navigation.navigate("CustomerAuth")}>{t("profile.login")}</Button>
                </View>;

                return <View style={{ justifyContent: "center", padding: spacing.md, gap: spacing.md }}>
                    <View style={{ alignItems: "center", gap: 12 }}>
                        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12, width: "100%" }}>
                            <Avatar id={profile.get().avatar} />
                        </View>
                        <View style={{ alignItems: "center", gap: 4 }}>
                            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: spacing.sm }}>
                                {profile?.get()?.displayname && <Text style={{ fontWeight: "bold", fontSize: 20, color: colors.primary }}>{profile?.get()?.displayname}</Text>}
                                {(profile.get()?.private) && <Ionicons name="lock-closed" size={20} color={colors.primary} />}
                            </View>
                            {profile?.get()?.username && <Text style={{ color: colors.foreground }}>@{profile?.get()?.username}</Text>}
                        </View>
                        {profile?.get()?._self && <Button onPress={() => navigation.navigate("CustomerProfileEdit")}>
                            {t("profile.edit")}
                        </Button>}
                    </View>

                    {profile?.get()?.preferences && <View style={{ gap: spacing.sm }}>
                        <Title>{t("profile.preferences")}</Title>
                        {profile?.get()?.preferences?.level && <>
                            <Data label="Level" value={profile?.get()?.preferences?.level} />
                        </>}
                        {profile?.get()?.preferences?.sport && <>
                            <Data label="Sport" value={profile?.get()?.preferences?.sport} />
                        </>}
                        {(
                            profile?.get()?.preferences?.sport === "football" &&
                            profile?.get()?.preferences?.position
                        ) && <>
                                <Data label="Position" value={profile?.get()?.preferences?.position} />
                            </>}
                    </View>}
                </View>;
            }}
        </Computed>
    </>
}

function Data({ label, value }) {
    return <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: spacing.md, backgroundColor: colors.subtle, borderRadius: radius.md }}>
        <View style={{ aspectRatio: 1, backgroundColor: colors.muted, borderRadius: radius.md, alignItems: "center", justifyContent: "center", height: 40 }} />
        <View>
            <Text style={{ fontWeight: "bold" }}>{label}</Text>
            <Text>{value}</Text>
        </View>
    </Pressable>
}

function Avatar({ id }) {
    const [source, setSource] = useState(null);
    const socket = useSocket("/");

    useEffect(() => {
        const unsubscribe = createSocketGetter({
            socket,
            event: "FILES/get",
            args: [id],
            setter: ({ buffer }: { buffer: ArrayBuffer }) => {
                if (buffer) {
                    const blob = new Blob([buffer]);
                    const url = URL.createObjectURL(blob);
                    setSource(url);
                }
            },
        });

        return () => unsubscribe();
    }, [id]);

    return <Pressable style={{ width: "33%", maxWidth: 400, aspectRatio: 1, backgroundColor: '#e4e4e4', borderRadius: radius.pill, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {source && <Image source={{ uri: source }} style={{ width: "100%", height: "100%" }} />}
    </Pressable>
}