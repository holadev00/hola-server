import { Text, View } from "react-native";
import { styles } from "hola-ui";
import { Link, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "hola-lang";
import Button from "@hola/ui/components/Button";

export function HomeScreen() {
    const { navigate, canGoBack, goBack } = useNavigation();
    const { t } = useTranslation();

    return (
        <SafeAreaView style={styles.screenContainer}>
            <View style={[styles.screenContent, { paddingHorizontal: 16, paddingTop: 16 }]}>
                <View style={styles.mainContentContainer}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingVertical: 8 }}>
                        <Link screen={"Home"} onPress={(e) => {
                            e.preventDefault();
                            if (canGoBack()) return goBack();
                            navigate("Home");
                        }}>
                            <Ionicons name="chevron-back" size={24} color="black" />
                        </Link>
                        <View style={styles.languageSelectorContainer}>
                            <Link screen={"CustomerAuthLangugage"}>
                                <Ionicons name="earth-outline" size={24} color="black" />
                            </Link>
                        </View>
                    </View>
                    <View style={styles.mainBody}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerSubtitle}>Welcome to</Text>
                            <Text style={[styles.headerTitle, { color: "#F97306" }]}>HOLA</Text>
                        </View>
                        <View style={styles.authOptionsContainer}>
                            <Button variant="secondary" disabled>
                                {t("home.auth.continue_with", { provider: "Google" })}
                            </Button>
                            <Button variant="secondary" disabled>
                                {t("home.auth.continue_with", { provider: "Apple" })}
                            </Button>
                            <Button onPress={() => navigate("CustomerAuthSignup")}>
                                {t("home.auth.sign_up_with", { provider: t("an_email") })}
                            </Button>
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.loginRedirectContainer}>
                <Link screen="CustomerAuthLogin">
                    <Text style={styles.loginRedirectText}>
                        {t("home.auth.already_have_an_account")} {t("home.auth.sign.in.cta")}
                    </Text>
                </Link>
            </View>
        </SafeAreaView>
    );
}