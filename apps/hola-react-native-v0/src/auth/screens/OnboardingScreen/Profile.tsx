import { View, Text, Switch, TextInput, Pressable, Alert } from "react-native";
import { Layout } from "hola-ui";
import { useTranslation } from "hola-lang";
import { Computed, useObservable, useObserveEffect } from "@legendapp/state/react";
import { useNavigation } from "@react-navigation/native";
import { onboarding$ } from "../../states/onboarding";
import { useEffect, useState } from "react";
import { Observable } from "@legendapp/state";
import * as ImagePicker from 'expo-image-picker';
import Input from "@hola/ui/components/Input";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "@hola/ui";
import { Image } from "expo-image";

export function OnboardingProfileScreen() {
    type Profile = Observable<{ avatar?: string; displayname?: string }>;

    const _profile: Profile = useObservable({
        avatar: onboarding$?.user?.avatar.get(),
        displayname: onboarding$?.user?.displayname.get(),
    });

    const { t } = useTranslation();
    const { navigate } = useNavigation();

    useObserveEffect(_profile.avatar, ({ value }) => {
        console.log(value);
    })

    const action = {
        label: t("home.conf.continue"),
        onPress: () => {
            const { avatar, displayname } = _profile.get();
            if (avatar) {
                onboarding$?.user?.avatar?.set(avatar);
            }
            if (displayname) {
                onboarding$?.user?.displayname?.set(displayname);
            }
            navigate("CustomerAuthOnboardingLangage");
        },
    };

    useEffect(() => {
        onboarding$.screen.set("Profile");
    }, []);

    const label = t("home.profile.username");

    return (
        <Layout title={t("home.profile.title")} primaryAction={action}>
            <Computed>
                {() => {
                    return (
                        <View style={{ gap: 16 }}>
                            <View style={{ gap: 8, width: "100%", alignItems: "center" }}>
                                <TestImagePicker
                                    blobCallback={(blob) => {
                                        _profile.avatar.set(blob);
                                    }}>
                                    {({ imageUri, pickImage }) => <Pressable style={{ alignItems: "center", justifyContent: "center", width: "33%", maxWidth: 400, minWidth: 100, backgroundColor: colors.subtle, aspectRatio: 1, borderRadius: 999, position: "relative" }}>
                                        {
                                            !imageUri ?
                                                <FontAwesome name="user" size={72} color={colors.muted} /> :
                                                <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%", borderRadius: 999 }} />
                                        }
                                        <Pressable style={{ position: "absolute", right: 0, bottom: 0, width: "30%", aspectRatio: 1, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center", borderRadius: 999 }} onPress={pickImage}>
                                            <FontAwesome name="camera" size={16} color="white" />
                                        </Pressable>
                                    </Pressable>
                                    }
                                </TestImagePicker>
                            </View>
                            <View style={{ gap: 8 }}>
                                <Text style={{ fontWeight: "500" }}>{label}</Text>
                                <Input placeholder={label} $value={_profile.displayname} />
                            </View>
                        </View>
                    )
                }}
            </Computed>
        </Layout>
    );
}

export function TestImagePicker({ blobCallback, children }: { blobCallback: (blob: Blob) => void, children?: ({ imageUri, pickImage }: { imageUri: string | null, pickImage: () => void }) => React.ReactNode }) {
    const [imageUri, setImageUri] = useState<string | null>(null)

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

        if (!permission.granted) {
            Alert.alert(
                'Permission required',
                'Permission to access the media library is required.'
            )
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        })

        if (result.canceled) return

        const asset = result.assets[0]

        // 👉 UI
        setImageUri(asset.uri)

        // 👉 Data (upload)
        const blob = await (await fetch(asset.uri)).blob()
        blobCallback(blob)
    }

    return children({
        imageUri,
        pickImage
    })
}