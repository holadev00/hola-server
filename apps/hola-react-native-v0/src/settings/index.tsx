import { $auth, useAuth } from "@hola/auth";
import { colors, spacing } from "@hola/ui";
import Button from "@hola/ui/components/Button";
import { FlatList, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Computed } from "@legendapp/state/react";

const settings = [
    {
        id: "0",
        label: "settings.language.label",
        description: "settings.language.description",
        action: <Link screen={"CustomerSettingsLanguage"}>
            <Button>Change</Button>
        </Link>
    },
    {
        id: "1",
        loggedInSetting: true,
        label: "settings.logout.label",
        description: "settings.logout.description",
        action: <LogoutButton />
    },
]

function Link({ children, screen, params }: any) {
    const { navigate } = useNavigation();

    return <Pressable onPress={() => navigate(screen, params)} pointerEvents="box-only">
        {children}
    </Pressable>;
}

export function SettingsScreen() {
    return <Computed>
        {() => {
            return <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <FlatList
                    data={settings.filter(s => s.loggedInSetting === undefined || s.loggedInSetting === $auth.get().isLoggedIn)}
                    renderItem={({ item }) => <Pressable style={{ paddingHorizontal: 0, paddingVertical: spacing.sm, flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: "bold" }}>{item.label}</Text>
                            <Text style={{ color: colors.muted }}>{item.description}</Text>
                        </View>
                        {item.action}
                    </Pressable>}
                    //ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#ddd" }} />}
                    keyExtractor={(item, index) => index.toString()}
                    style={{ width: "100%", paddingHorizontal: spacing.lg }}
                />
            </View>
        }}
    </Computed>
}

export function LogoutButton() {
    const { logout } = useAuth();
    const { navigate } = useNavigation();

    return <Button onPress={() => {
        logout();
        //navigate("CustomerAuth");
    }}>
        Logout
    </Button>;
}