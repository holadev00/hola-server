import { NavigationContainer } from "@react-navigation/native";
import { Tab } from "./tab";
import { HomeScreen } from "@hola/home/screen";
import { FontAwesome5, Ionicons, Octicons } from "@expo/vector-icons";
import { useMobileLayout } from "./hooks/useMobileLayout";
import { AppLayout } from "./components/AppLayout";
import { Empty } from "./components/Empty";
import { Test } from "./components/Test";
import { rightHeaderCog } from "./functions/rightHeaderCog";
import { MatchesByVenueScreen } from "@hola/matches/screens/venue";
import { MatchCreationScreen } from "@hola/matches/screens/create/date";
import { MatchCreationOptionScreen } from "@hola/matches/screens/create/options";
import { MatchCreationCheckoutScreen } from "@hola/matches/screens/create/checkout";
import { withVenueScreenProvider } from "@hola/matches/contexts/venuesScreen";
import { leftHeaderBack } from "./functions/leftHeaderBack";
import { MatchDetailsScreen } from "@hola/matches/screens/details";
import { MatchRequestScreen } from "@hola/matches/screens/request";
import { Computed, use$ } from "@legendapp/state/react";
import { screenOptions } from "./screenOptions";
import { linking } from "./linking";
import { CustomerMatchesScreen } from "@hola/matches/screens";
import { $auth, useAuth } from "@hola/auth";
import { useTabBarFocus } from "./hooks/useTabBarFocus";
import { tabBarItemColor } from "./style";
import { SplashScreen, $splash } from "./SplashScreen";
import { SettingsScreen } from "@hola/settings";
import * as auth from "@hola/auth";
import { ProfileScreen } from "@hola/profile/screens";
import { SelectorScreen as LangSelectorScreen } from "@hola/lang";
import { colors, spacing } from "@hola/ui";

export function Navigation() {
    return <NavigationContainer linking={linking}>
        <AppLayout>
            <Navigator />
        </AppLayout>
    </NavigationContainer>
}

function Navigator() {
    const { mobile } = useMobileLayout();

    useAuth();

    return <Computed>
        {function () {
            const isManager = $auth?.get()?.isManager;
            const isLogged = $auth?.get()?.isLoggedIn;
            const isInitialized = $auth?.get()?.initialized;
            const splash = $splash.get();

            if (!isInitialized || splash) return <SplashScreen />;

            return <Tab.Navigator screenOptions={screenOptions}>
                {!isManager && <>
                    {mobile && <Tab.Screen
                        name="CustomerHome"
                        component={mobile ? HomeScreen : Empty}
                        options={({ navigation, route }) => ({
                            tabBarItemStyle: {},
                            title: 'Home',
                            tabBarIcon() {
                                let isFocused = useTabBarFocus(navigation, route);
                                return (
                                    <Octicons name="home" size={22} color={tabBarItemColor(isFocused)} />
                                );
                            },
                            headerShown: false
                        })} />}
                    <Tab.Screen
                        name="CustomerMatches"
                        component={CustomerMatchesScreen}
                        options={({ navigation, route }) => ({
                            tabBarItemStyle: { display: "none" }, // TODO
                            title: 'Matches',
                            tabBarIcon() {
                                let isFocused = useTabBarFocus(navigation, route);
                                return (
                                    <Ionicons name="football" size={25} color={tabBarItemColor(isFocused)} />
                                );
                            },
                            ...rightHeaderCog(navigation)
                        })} />
                    {/* Matches à la une, etc... */}
                    <Tab.Screen name="CustomerMatchesSearch" component={Test} />
                    <Tab.Screen
                        name="CustomerMatchesByVenue"
                        component={withVenueScreenProvider(MatchesByVenueScreen)}
                        options={({ navigation }) => ({
                            ...leftHeaderBack(navigation, "CustomerMatches")
                        })} />
                    <Tab.Screen
                        name="CustomerMatchCreationDate"
                        component={withVenueScreenProvider(MatchCreationScreen)}
                        options={({ navigation }) => ({
                            ...leftHeaderBack(navigation, "CustomerMatches")
                        })} />
                    <Tab.Screen
                        name="CustomerMatchCreationOptions"
                        component={withVenueScreenProvider(MatchCreationOptionScreen)}
                        options={({ navigation }) => ({
                            ...leftHeaderBack(navigation, "CustomerMatchCreationDate")
                        })} />
                    <Tab.Screen
                        name="CustomerMatchCreationCheckout"
                        component={withVenueScreenProvider(MatchCreationCheckoutScreen)}
                        options={({ navigation }) => ({ ...leftHeaderBack(navigation, "CustomerMatchCreationOptions") })} />
                    <Tab.Screen
                        name="CustomerMatchDetails"
                        component={MatchDetailsScreen}
                        options={({ navigation }) => ({
                            ...leftHeaderBack(navigation)
                        })} />
                    <Tab.Screen name="CustomerMatchRequest" component={MatchRequestScreen} />
                    <Tab.Screen name="CustomerShareMatch" component={Test} />
                    <Tab.Screen name="CustomerShareMatchToFriends" component={Test} />
                    <Tab.Screen name="CustomerSharedMatchQRCodeScan" component={Test} />
                    <Tab.Screen name="CustomerSharedInvites" component={Test} />
                    <Tab.Screen
                        name="CustomerProfile"
                        component={ProfileScreen}
                        options={({ navigation, route }) => ({
                            tabBarItemStyle: {
                                display: isLogged ? "flex" : "none"
                            },
                            title: 'Profile',
                            tabBarIcon() {
                                let isFocused = useTabBarFocus(navigation, route);
                                return (
                                    <Octicons name="person" size={24} color={tabBarItemColor(isFocused)} />
                                );
                            },
                            ...leftHeaderBack(navigation, "CustomerHome"),
                            ...rightHeaderCog(navigation)
                        })} />
                    <Tab.Screen
                        name="CustomerProfileEdit"
                        component={Test}
                        options={({ navigation }) => ({
                            ...leftHeaderBack(navigation, "CustomerProfile")
                        })} />
                    <Tab.Screen name="CustomerSettings" component={SettingsScreen} />
                    <Tab.Screen name="CustomerSettingsLanguage" component={LangSelectorScreen} options={({ navigation }) => ({
                        ...leftHeaderBack(navigation, "CustomerSettings"),
                        sceneStyle: {
                            paddingHorizontal: spacing.lg,
                            paddingBottom: spacing.lg,
                            backgroundColor: colors.background
                        }
                    })} />
                    <Tab.Screen
                        name="CustomerSocial"
                        component={Test}
                        options={({ navigation, route }) => ({
                            tabBarItemStyle: {
                                display: isLogged ? "flex" : "none"
                            },
                            title: 'Social',
                            tabBarIcon() {
                                let isFocused = useTabBarFocus(navigation, route);

                                return <Octicons name="people" size={27} color={tabBarItemColor(isFocused)} />
                            },
                            ...rightHeaderCog(navigation)
                        })} />
                    {/* Liste d'amis, groupes de matches à venir, etc... */}
                    <Tab.Screen name="CustomerSocialMatchChat" component={Test} />
                    <Tab.Screen name="CustomerSocialBlockedUsers" component={Test} />
                    {!isLogged && <Tab.Screen
                        name="CustomerAuth"
                        component={auth.screens.Home}
                        options={({ navigation, route }) => ({
                            tabBarItemStyle: {
                                display: !isLogged ? "flex" : "none"
                            },
                            headerShown: false,
                            title: 'Auth',
                            tabBarIcon: () => {
                                let isFocused = useTabBarFocus(navigation, route);

                                return <FontAwesome5 name="door-open" size={22} color={tabBarItemColor(isFocused)} />
                            }
                        })} />}
                    {!isLogged && <Tab.Screen
                        name="CustomerAuthLangugage"
                        component={auth.screens.Lang}
                        options={{
                            sceneStyle: { backgroundColor: colors.background, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
                        }} />}
                    {!isLogged && <Tab.Screen
                        name="CustomerAuthLogin"
                        component={auth.screens.Login}
                        options={{ headerShown: false }} />}
                    {!isLogged && <Tab.Screen name="CustomerAuthForgot" component={Test} />}
                    {!isLogged && <Tab.Screen name="CustomerAuthReset" component={Test} />}
                    {!isLogged && <Tab.Screen
                        name="CustomerAuthSignup"
                        component={auth.screens.SignUp}
                        options={{ headerShown: false }} />}
                    {!isLogged && <Tab.Screen
                        name="CustomerAuthOnboardingProfile"
                        component={auth.screens.Onboarding.Profile}
                        options={{ headerShown: false }} />}
                    {!isLogged && <Tab.Screen
                        name="CustomerAuthOnboardingLangage"
                        component={auth.screens.Onboarding.Lang}
                        options={{ headerShown: false }} />}
                    {!isLogged && <Tab.Screen
                        name="CustomerAuthOnboardingPreferences"
                        component={auth.screens.Onboarding.Pref}
                        options={{ headerShown: false }} />}
                    {!isLogged && <Tab.Screen
                        name="CustomerAuthOnboardingConfidentiality"
                        component={auth.screens.Onboarding.Conf}
                        options={{ headerShown: false }} />}
                    {!isLogged && <Tab.Screen
                        name="CustomerAuthOnboardingTutorial"
                        component={auth.screens.Onboarding.Tuto}
                        options={{ headerShown: false }} />}
                </>}
                {/*<Tab.Screen name="ManagerHome" component={Test} options={{ tabBarItemStyle: {} }} />{/* Gestion des venues */}
            </Tab.Navigator>
        }}
    </Computed>
}