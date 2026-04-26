import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
import * as Icons from "@expo/vector-icons";
import { createContext, JSX, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Computed, Switch, useObservable } from "@legendapp/state/react";
import { usePreferences } from "@hola/react-provider";
import { NavigationContainer, useLocale, useNavigation, useRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HeaderBackButton } from "@react-navigation/elements";
import { LinearGradient } from 'expo-linear-gradient';
import Color from "colorjs.io";
import moment from "moment";
import { Picker } from '@react-native-picker/picker';
import { configureSynced, syncObservable } from '@legendapp/state/sync'
import { observablePersistAsyncStorage } from '@legendapp/state/persist-plugins/async-storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { io } from "socket.io-client";
import { observable } from "@legendapp/state";

const loggedIn$ = observable(true);
const managerModeEnabled$ = observable(true);

const socket = io("http://localhost", { transports: ['websocket'] });
export function HolaStripeProvider({ children, locale, currency, amount, quantity = 1, venue, onComplete = () => { } }) {
    const [loading, setLoading] = useState(true);
    const _seshId = useObservable(null);

    const stripePromise = useMemo(() => {
        const pKey = async () => await socket.emitWithAck(`STRIPE/pbsh`);
        return pKey()
            .then(loadStripe);
    }, []);

    const fetchClientSecret = useCallback(() => {
        if (!currency || !amount || !quantity || !venue) return;

        setLoading(true);
        const checkoutSession = async () => await socket.emitWithAck(`STRIPE/cs`, { venue, currency, amount, quantity, locale });

        return checkoutSession()
            .then((data) => {
                setLoading(false);
                if (!data.checkoutSessionId) return;
                _seshId.set(data.checkoutSessionId);
                return data
            })
            .then((data) => data.checkoutSessionClientSecret);
    }, [currency, amount, quantity, venue]);

    return (
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{
            fetchClientSecret,
            onComplete: () => {
                onComplete(_seshId.get());
            }
        }}>
            {loading ?
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator />
                </View> :
                children}
        </EmbeddedCheckoutProvider>
    );
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function t(...strings: string[]) {
    return strings.join(" ");
}

const linking = {
    prefixes: ["hola://"],
    enabled: 'auto',
    lowercase: true,
};

export default function App() {
    return <Computed>
        {function () {
            const loggedIn = loggedIn$.get();
            const managerModeEnabled = managerModeEnabled$.get();

            const unloggedUser = !loggedIn;
            const regularUser = loggedIn && !managerModeEnabled;
            const managerUser = loggedIn && managerModeEnabled;

            return <>
                <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
                    <Tab.Navigator screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: "white" }, tabBarStyle: { backgroundColor: "white", height: 60 } }}>
                        {unloggedUser && <Tab.Screen name="Login" component={LoginNavigator} options={{ tabBarStyle: { display: 'none' } }} />}
                        {managerUser && <Tab.Screen name="Dashboard" component={ManagerDashboardNavigator} />}
                        {managerUser && <Tab.Screen name="Reservations" component={ManagerReservationsNavigator} />}
                        {managerUser && <Tab.Screen name="Courts" component={ManagerCourtsNavigator} />}
                        {managerUser && <Tab.Screen name="Players" component={ManagerPlayersNavigator} />}
                        {managerUser && <Tab.Screen name="Settings" component={ManagerSettingsNavigator} />}
                        {regularUser && <Tab.Screen name="Home" component={HomeNavigator} />}
                        {regularUser && <Tab.Screen name="Explorer" component={ExplorerNavigator} />}
                        {regularUser && <Tab.Screen name="Create" component={CreateNavigator} options={{ tabBarStyle: { display: 'none' } }} />}
                        {(regularUser || unloggedUser) && <Tab.Screen name="Match" component={MatchesNavigator} options={{ tabBarItemStyle: { display: 'none' }, tabBarStyle: { display: 'none' } }} />}
                        {regularUser && <Tab.Screen name="Social" component={SocialNavigator} />}
                        {regularUser && <Tab.Screen name="Profile" component={ProfileNavigator} />}
                        {regularUser && <Tab.Screen name="Settings" component={SettingsNavigator} options={{ tabBarItemStyle: { display: 'none' }, tabBarStyle: { display: 'none' } }} />}
                    </Tab.Navigator>
                </NavigationContainer>
            </>;
        }}
    </Computed>
}

function LoginNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}>
            <Stack.Screen name="Index" component={LoginScreen} />
        </Stack.Navigator>
    );
}

function LoginScreen() {
    return <>
        <Text>Login</Text>
    </>;
}

function HomeNavigator() {
    return (
        <HomeProvider>
            <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}>
                <Stack.Screen name="Index" component={HomeScreen} />
                <Stack.Screen name="Nearby" component={NearbyScreen} />
            </Stack.Navigator>
        </HomeProvider>
    );
}

function ExplorerNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}>
            <Stack.Screen name="Index" component={ExplorerScreen} />
        </Stack.Navigator>
    );
}

function CreateNavigator() {
    return (
        <CreateProvider>
            <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}>
                <Stack.Screen name="Index" component={CreateScreen} />
            </Stack.Navigator>
        </CreateProvider>
    );
}

function MatchesNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}>
            <Stack.Screen name="Index" component={MatchesScreen} />
            <Stack.Screen name="Details" component={MatchDetailsScreen} />
        </Stack.Navigator>
    );
}

function SocialNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}>
            <Stack.Screen name="Index" component={SocialScreen} />
        </Stack.Navigator>
    );
}

const ProfileContext = createContext();
export function useProfile() {
    return useContext(ProfileContext);
}

function ProfileProvider({ children }: { children: React.ReactNode }) {
    const profiles = useObservable({
        thisUser: {
            displayname: "John Doe",
            username: "johndoe",
            color: "#FF0000",
            averageRate: 4.5,
            level: "advanced",
            nbMatches: 10,
            nbHostedMatches: 5,
            nbFriends: 5,
            recentMatches: [
                {
                    venueName: "venueName",
                    matchDate: "2026-04-08T13:00:30.000+02:00",
                    matchNbPlayers: 8
                }
            ]
        }
    });

    return <Computed>
        {() => <ProfileContext.Provider value={profiles.get()}>
            {children}
        </ProfileContext.Provider>}
    </Computed>;
}

function SettingsNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}>
            <Stack.Screen name="SettingsNotifications" component={SettingsNotificationsScreen} />
            <Stack.Screen name="SettingsPayment" component={SettingsPaymentScreen} />
        </Stack.Navigator>
    );
}

function ProfileNavigator() {
    return (
        <ProfileProvider>
            <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'white' } }}>
                <Stack.Screen name="Index" component={ProfileScreen} />
                <Stack.Screen name="OtherUser" component={ProfileScreen} />
            </Stack.Navigator>
        </ProfileProvider>
    );
}

function ExplorerScreen() {
    return <ExplorerScreenProvider>
        <Screen>
            <ExplorerScreenHeader />
            <View className="gap-4">
                <ExplorerScreenSearch />
                <ExplorerScreenFilters />
            </View>
            <ExplorerScreenMap />
            <ExplorerScreenList />
        </Screen>
    </ExplorerScreenProvider>;
}

const ExplorerScreenContext = createContext();
export function useExplorerScreen() {
    return useContext(ExplorerScreenContext);
}

function ExplorerScreenProvider({ children }: { children: React.ReactNode }) {
    const store = useObservable({
        results: [
            { type: "venue", venueName: "venueName", distance: { amount: 2, unit: "kilometer" } },
            { type: "match", venueName: "matchName", distance: { amount: 2, unit: "kilometer" }, date: "2026-04-11T22:00:30.000+02:00" },
            { type: "match", venueName: "matchName", distance: { amount: 2, unit: "kilometer" }, date: "2026-04-11T13:00:30.000+02:00" },
            { type: "match", venueName: "matchName", distance: { amount: 2, unit: "kilometer" }, date: "2026-04-12T23:00:30.000+02:00" }
        ],
        activeSearch: false,
        activeMap: false,
        activeFilter: "all"
    });

    return <Computed>
        {function () {
            return <ExplorerScreenContext.Provider value={{
                results: store.get().results,
                activeSearch: store.get().activeSearch,
                setActiveSearch: (search) => store.activeSearch.set(search),
                activeMap: store.get().activeMap,
                setActiveMap: (search) => store.activeMap.set(search),
                activeFilter: store.get().activeFilter,
                setActiveFilter: (filter) => store.activeFilter.set(filter)
            }}>
                {children}
            </ExplorerScreenContext.Provider>;
        }}
    </Computed>;
}

function ExplorerScreenHeader() {
    return <Text className="text-2xl font-bold text-gray-800 leading-6">{t("explorer.title")}</Text>;
}

function ExplorerScreenSearch() {
    const { activeSearch, setActiveSearch, activeMap } = useExplorerScreen();

    return !activeMap && <View className="flex-row gap-1 items-center">
        <View className="flex-1">
            <Input
                placeholder={t("explorer.search.placeholder")}
                onFocus={() => setActiveSearch(true)} />
        </View>
        {activeSearch && <Pressable onPress={() => setActiveSearch(false)}>
            <Icons.Feather name="x" size={28} color={"#757575"} />
        </Pressable>}
    </View>
}

function ExplorerScreenFilters() {
    const { activeSearch, activeMap } = useExplorerScreen();

    return (!activeSearch && !activeMap) && <ScrollView className="flex-row" contentContainerClassName="gap-2" showsHorizontalScrollIndicator={false} horizontal={true}>
        <ExplorerScreenFilter title="all" />
        <ExplorerScreenFilter title="venues" />
        <ExplorerScreenFilter title="tonight" />
        <ExplorerScreenFilter title="tomorrow" />
    </ScrollView>;
}

function ExplorerScreenFilter({ title }: { title: string }) {
    const { activeFilter, setActiveFilter } = useExplorerScreen();

    const backgroundStyle = useMemo(() => activeFilter === title ? { backgroundColor: "#ff6b2b" } : {}, [activeFilter, title]);
    const textColorStyle = useMemo(() => activeFilter === title ? { color: "white" } : {}, [activeFilter, title]);

    return <TouchableOpacity className="p-2 rounded-full bg-gray-200" activeOpacity={0.8} style={[{ paddingHorizontal: 16 }, backgroundStyle]} onPress={() => setActiveFilter(title)}>
        <Text className="text-sm font-semibold text-gray-800" style={textColorStyle}>{t(`explorer.filters.${title}`)}</Text>
    </TouchableOpacity>;
}

function ExplorerScreenMap() {
    const { activeSearch, activeMap, setActiveMap } = useExplorerScreen();
    const containerStyle = useMemo(() => activeMap ? { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flex: 1, height: "calc(100dvh - 60px)", borderRadius: 0 } : { height: 180, borderRadius: 16 }, [activeMap]);

    return !activeSearch && <View style={containerStyle} className="overflow-hidden">
        <Pressable className="bg-gray-200 flex-1" style={{ position: "relative" }}>
            <Pressable className="p-2 rounded-lg bg-[#ff6b2b] flex-row items-center gap-1" style={{ position: "absolute", bottom: 10, right: 10, width: "auto", paddingHorizontal: 16 }} onPress={() => setActiveMap(!activeMap)}>
                <Icons.MaterialIcons name="fullscreen" size={18} color={"#fff"} />
                <Text className="text-sm font-semibold text-white flex flex-row items-center">
                    {t("explorer.map.fullscreen")}
                </Text>
            </Pressable>
        </Pressable>
    </View>;
}

function ExplorerScreenList() {
    const { results = [], activeFilter = "all" } = useExplorerScreen();

    function filterFn(result) {
        const now = moment();
        const tonight = (now.hour() >= 17 ? now : now.set("hour", 17).startOf("hour")).format("YYYY-MM-DD HH:mm");
        const tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

        if (activeFilter === "venues") return result?.type === "venue";
        if (activeFilter === "tonight") return result?.type === "match" && moment(result?.date).isBetween(tonight, tomorrow, "hour", "[)");
        if (activeFilter === "tomorrow") return result?.type === "match" && moment(result?.date).isSame(tomorrow, "day");

        if (result?.type === "match") return moment(result?.date).isAfter(now, "minute");
        return true;
    }

    const filteredResults = useMemo(() => results.filter(filterFn), [results, activeFilter]);

    return <View className="items-start gap-2">
        {filteredResults.length === 0 ?
            <Text className="text-gray-400 text-center">{t("explorer.empty")}</Text> :
            <Text className="text-gray-400 text-center">{filteredResults.length} {filteredResults.length === 1 ? t("explorer.result") : t("explorer.results")}</Text>
        }

        <FlatList
            className="flex-1 w-full"
            contentContainerClassName="gap-2"
            data={filteredResults}
            renderItem={({ item }) => <ExplorerListItem item={item} />}
            keyExtractor={(item, index) => index.toString()}
            style={{ overflow: "visible" }}
        />
    </View>
}

function ExplorerListItem({ item }: { item: any }): JSX.Element {
    const { navigate } = useNavigation();
    const { locale } = usePreferences();

    const day = item?.date && (
        moment().diff(item?.date, "days") < 2 ?
            new Intl.RelativeTimeFormat(locale, { style: "long", numeric: "auto" }).format(
                -moment().diff(item?.date, "days"),
                "day"
            ) :
            new Intl.DateTimeFormat(locale, { weekday: "long" }).format(new Date(item?.date))
    );
    const hour = item?.date && new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "numeric" }).format(new Date(item?.date));
    const distance = item?.distance && new Intl.NumberFormat(locale, { style: "unit", unit: item?.distance?.unit ?? "kilometer", unitDisplay: "short" }).format(item?.distance.amount ?? 0);

    const screen = item?.type === "match" ? ["Match", { screen: "Details", params: { id: item?.id } }] :
        item?.type === "venue" ? ["Venue", { screen: "Details", params: { id: item?.id } }] :
            item?.type === "event" ? ["Event", { screen: "Details", params: { id: item?.id } }] :
                null;

    return <Pressable onPress={() => screen && navigate(...screen)}>
        <Card>
            <View className="p-4">
                <Text className="text-[12px] text-gray-400">{t(`explorer.types.${item.type}`)}</Text>
                <View className="flex-row items-center gap-2 justify-between">
                    <Text className="text-[18px] leading-6 font-semibold">{item.venueName}</Text>
                    <Badge>{t(`explorer.types.${item.type}`)}</Badge>
                </View>
                <View className="flex-row items-center gap-1 text-gray-400">
                    {item.type === "match" && <>
                        <Text className="text-[12px] text-inherit">{day}</Text>
                        <Text className="text-[12px] text-inherit">·</Text>
                        <Text className="text-[12px] text-inherit">{hour}</Text>
                        <Text className="text-[12px] text-inherit">·</Text>
                    </>}
                    <Text className="text-[12px] text-inherit">{distance}</Text>

                </View>
            </View>
        </Card>
    </Pressable>
}

function MatchesScreen() {
    return <Text>Matches</Text>;
}

function SettingsNotificationsScreen() {
    return <>
        <BackButton backNavigateTo="Profile" />
        <Text>Notifications</Text>
    </>;
}

function SettingsPaymentScreen() {
    return <>
        <BackButton backNavigateTo="Profile" />
        <Text>Payment</Text>
    </>;
}


const ProfileScreenContext = createContext({});

export function useProfileScreen() {
    return useContext(ProfileScreenContext);
}

function ProfileScreenProvider({ children, user }: { children: React.ReactNode, user?: any }) {
    const { thisUser, ...profiles } = useProfile();

    return <Computed>
        {() => <ProfileScreenContext.Provider value={user ? profiles?.[user] : thisUser}>
            {children}
        </ProfileScreenContext.Provider>}
    </Computed>;
}

function ProfileScreen() {
    const user = useRoute().params?.user;

    return <ProfileScreenProvider user={user}>
        <ScrollView className="bg-white">
            <Screen>
                <ProfileInfos />
                <ScreenSection title={t('profile.recentMatches')}>
                    <ProfileScreenRecentMatches />
                </ScreenSection>
                {!user && <ScreenSection title={t('profile.settings')}>
                    <ProfileScreenSettings />
                </ScreenSection>}
            </Screen>
        </ScrollView>
    </ProfileScreenProvider>;
}

function ProfileScreenSettings() {
    const { navigate } = useNavigation();

    const settings = [
        { id: "0", label: "settings.notifications.label", onPress: () => navigate("Settings", { screen: "SettingsNotifications" }), },
        { id: "1", label: "settings.payment.label", onPress: () => navigate("Settings", { screen: "SettingsPayment" }), },
        { id: "2", label: "settings.logout.label", onPress: () => console.log('press'), color: "#FF0000" },
    ];

    function SettingsItem({ item }) {
        const textStyle = item?.color ? { color: item?.color } : {};

        return <Pressable className="flex-row justify-between items-center p-4 text-gray-400" style={[{ paddingHorizontal: 0 }, textStyle]} onPress={item.onPress}>
            <Text className="" style={{ color: "inherit" }}>{t(item.label)}</Text>
            <Icons.Ionicons name="chevron-forward" size={18} color="inherit" />
        </Pressable>;
    }

    return <FlatList
        data={settings}
        renderItem={({ item }) => <SettingsItem item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#ddd" }} />}
        keyExtractor={(item, index) => index.toString()}
    />;
}

function ProfileScreenRecentMatches() {
    const { recentMatches } = useProfileScreen();

    if (!recentMatches) return <Text>{t('profile.noRecentMatches')}</Text>;

    function MatchCard({ match: { venueName, matchDate, matchNbPlayers } }) {
        const date = new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(matchDate));
        const { navigate } = useNavigation();

        return <Pressable onPress={() => navigate('Details', { match: { venueName, matchDate, matchNbPlayers } })}>
            <Card>
                <View className="p-4 flex-row justify-between items-center">
                    <View>
                        <Text className="font-bold text-lg">{venueName}</Text>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-gray-400 text-[12px]">{date}</Text>
                            <Text className="text-gray-400 text-[12px]">{matchNbPlayers} {t('match.players')}</Text>
                        </View>
                    </View>
                    <Badge>{t('match.played')}</Badge>
                </View>
            </Card>
        </Pressable>
    }

    return recentMatches.map((match, index) => <MatchCard key={index} match={match} />);
}

function Badge({ children }: { children: React.ReactNode }) {
    return <Text className="text-xs text-gray-400 rounded-full bg-gray-100 py-1 px-2">{children}</Text>;
}

function ProfileInfos() {
    const profile = useProfileScreen();

    function StatItem({ number, label }) {
        return <View className="flex-1 items-center p-4 bg-gray-100 rounded-lg">
            <Text className="text-[#ff6b2b] text-2xl font-bold">{number ?? 0}</Text>
            <Text className="text-gray-400" numberOfLines={1}>{label}</Text>
        </View>;
    }

    return <View className="items-center gap-5">
        <View className="gap-3 items-center">
            <PlayersAvatarsRow players={[profile]} size={90} />
            <View className="gap-1 items-center">
                <Text className="font-bold text-2xl">{profile?.displayname}</Text>
                <View className="flex-row items-center gap-1">
                    <Text className="text-gray-400">@{profile?.username}</Text>
                </View>
            </View>
            <View className="flex-row items-center gap-1">
                <Badge><Icons.Ionicons name="star" size={14} color={"#FFD700"} /> {profile?.averageRate}</Badge>
                <Badge>{t(`profile.level.${profile?.level}`)}</Badge>
            </View>
        </View>
        <View className="flex-row gap-3 w-full">
            <StatItem number={profile?.nbMatches} label={t("profile.matches")} />
            <StatItem number={profile?.nbFriends} label={t("profile.friends")} />
            <StatItem number={profile?.nbHostedMatches} label={t("profile.hostedMatches")} />
        </View>
    </View>;
}

const MatchDetailsContext = createContext({});

function useMatchDetails() {
    return useContext(MatchDetailsContext);
}

function MatchDetailsProvider({ children }: { children: React.ReactNode }) {
    const { locale } = usePreferences();
    const players = [
        { id: "1", name: "player1", color: "hotpink", reservedSlots: 4, host: true, nbHostedMatches: 32, averageRate: 4.5 },
        { id: "2", name: "player2", color: "deepskyblue" },
        { id: "3", name: "player3", color: "yellowgreen" },
        { id: "4", name: "player4", color: "silver" },
        { id: "5", name: "player5", color: "gold" },
        { id: "6", name: "player6", color: "goldenrod" },
        { id: "7", name: "player7", color: "crimson" }
    ];
    const maxPlayersNb = 10;
    const nbTickets = players.reduce((a, c) => a + (c.reservedSlots ?? 1), 0);
    const pricePerPlayer = { amount: 10, currency: "EUR" };

    return <MatchDetailsContext.Provider value={{
        venue: {
            id: "1",
            name: "venueName"
        },
        court: {
            id: "1",
            name: "courtName",
            flooring: "grass",
        },
        players,
        maxPlayersNb,
        sport: "football5",
        level: "beginner",
        description: "Match amical, ambiance détendue. Tous niveaux bienvenus. Venez avec vos crampons !",
        start: "2026-04-08T13:00:30.000+02:00",
        end: "2026-04-08T14:00:30.000+02:00",
        price: formatPrice(locale, pricePerPlayer.currency, pricePerPlayer.amount),
        complete: (nbTickets / maxPlayersNb) >= 1,
        nbTickets
    }}>
        {children}
    </MatchDetailsContext.Provider>;
}

function MatchDetailsScreen() {
    return <MatchDetailsProvider>
        <View className="flex-1">
            <MatchDetailsScreenHeader />
            <ScrollView className="flex-1 p-5" contentContainerClassName="gap-4">
                <MatchDetailsScreenInfoCard />
                <MatchDetailsScreenInfos />
            </ScrollView>
            <MatchDetailsFooter />
        </View>
    </MatchDetailsProvider>
}

function MatchDetailsFooter() {
    const { price, complete } = useMatchDetails();

    return <View className="gap-4 flex-row px-5 py-3 items-center" style={{ borderTopWidth: 1, borderColor: "#ccc" }}>
        <Button outline title={t(`match.share`)} />
        {!complete ?
            <Button className={"flex-1"} title={`${t(`match.join`)} · ${price}`}></Button> :
            <Button className={"flex-1"} secondary title={`${t(`match.complete`)}`}></Button>
        }
    </View >
}

function ScreenSection({ title = "title", children }: { title?: string, children?: React.ReactNode }) {
    return <View className="gap-3">
        <Text style={{ color: "#0008", textTransform: "uppercase", fontWeight: "700" }}>{title}</Text>
        {children}
    </View>
}

function MatchDetailsScreenInfos() {
    const { players, nbTickets, maxPlayersNb } = useMatchDetails();

    return <>
        <ScreenSection title={t('match.founder')}>
            <PlayersFounderInfo />
        </ScreenSection>
        <ScreenSection title={t('match.description')}>
            <MatchDetailsScreenDescription />
        </ScreenSection>
        <ScreenSection title={<>{t('match.players')} ({nbTickets}/{maxPlayersNb})</>}>
            {players.map((player) => <PlayerInfo key={player.id} player={player} />)}
        </ScreenSection>
    </>
}

function MatchDetailsScreenDescription() {
    const { description } = useMatchDetails();
    return <Text>{description}</Text>
}

function PlayersFounderInfo() {
    const { players } = useMatchDetails();
    const host = players.find((player) => player.host);

    return <View className="flex-row gap-2 items-center">
        <PlayersAvatarsRow players={[host]} limit={1} />
        <View>
            <Text className="font-bold">{host.name}</Text>
            <View className="flex-row">
                <Text className="text-[12px]" style={{ color: "#0008" }}> {host.averageRate} </Text>
                <Text className="text-[12px]" style={{ color: "#0008" }}>·</Text>
                <Text className="text-[12px]" style={{ color: "#0008" }}> {t('match.hostedMatches', { count: host.nbHostedMatches })} </Text>
            </View>
        </View>
    </View>
}

function PlayerInfo({ player }) {
    return <View className="flex-row gap-2 items-center">
        <PlayersAvatarsRow players={[player]} limit={1} />
        <View className="flex-row items-center gap-1">
            <Text className="font-semibold">{player?.name}</Text>
            {<View className="flex-row">
                {player?.host && <>
                    <Text className="text-[12px]" style={{ color: "#0008" }}>·</Text>
                    <Text className="text-[12px]" style={{ color: "#0008" }}> {player?.host && t('match.host')} </Text>
                </>}
                {player?.reservedSlots > 0 && <>
                    <Text className="text-[12px]" style={{ color: "#0008" }}>·</Text>
                    <Text className="text-[12px]" style={{ color: "#0008" }}> {t('match.reservedSlots', { count: player?.reservedSlots })} </Text>
                </>}
            </View>}
        </View>
    </View>
}

function MatchDetailsScreenInfoCard() {
    const { sport, level, price, court } = useMatchDetails();

    function Section({ title = "title", desc = "desc", descColor }: { title?: string, desc?: string, descColor?: string }) {
        return <View>
            <Text className="text-black/70">{title}</Text>
            <Text className="font-bold text-lg leading-6" style={{ color: descColor }}>{desc}</Text>
        </View>
    }

    return <Card>
        <View className="p-4 flex-row gap-2">
            <View className="flex-1 gap-2">
                <Section title={t('match.format')} desc={t(`match.sport.${sport}`)} />
                <Section title={t('match.price')} desc={t('prices.per_player', price)} descColor={"#ff6b2b"} />
            </View>
            <View className="flex-1 gap-2">
                <Section title={t('match.level')} desc={t(`match.level.${level}`)} />
                <Section title={t('match.terrain')} desc={t(`match.court.${court?.flooring}`)} />
            </View>
        </View>
    </Card>
}

function BackButton({ backNavigateTo }: { backNavigateTo?: string }) {
    const navigation = useNavigation();

    return <HeaderBackButton style={{ margin: 0, width: 100, gap: 8, transform: [{ scale: 0.8 }], transformOrigin: 'left top', marginBottom: -2 }} tintColor="lightgrey" allowFontScaling onPress={() => backNavigateTo ? navigation.navigate(backNavigateTo) : navigation.goBack()} label={t(`navigation.back`)} displayMode={"default"} />
}

function MatchDetailsScreenHeader() {
    const { start, end, complete, venue, players } = useMatchDetails();
    const { locale } = usePreferences();

    const day = new Date(start).toLocaleDateString(locale, { weekday: "long", year: "numeric", day: "numeric", month: "long" });
    const startHour = new Date(start).toLocaleTimeString(locale, { hour: "numeric", minute: "numeric" });
    const endHour = new Date(end).toLocaleTimeString(locale, { hour: "numeric", minute: "numeric" });

    return <LinearGradient colors={['#1A1A1A', '#2D4A1E']}>
        <View className="p-5 gap-4 items-start">
            <BackButton />

            <View className="gap-3">
                <View className="py-1.5 px-3 rounded-full bg-[#ECFDF3]">
                    <View className="flex-row gap-1">
                        <Text className="text-[12px] text-gray-400">{t(!complete ? `match.opened` : `match.complete`)}</Text>
                        <Text className="text-[12px] text-gray-400">·</Text>
                        <Text className="text-[12px] text-gray-400">{t("match.remaining_places", { remaining_places: 3 })}</Text>
                    </View>
                </View>

                <Text className="text-white text-3xl font-semibold leading-6" numberOfLines={1}>{venue?.name}</Text>
                <View className="flex-row gap-1">
                    <Text className="text-white/70">{day}</Text>
                    <Text className="text-white/70">·</Text>
                    <Text className="text-white/70">{startHour}-{endHour}</Text>
                </View>

                <View className="flex-row gap-2 items-center gap-2">
                    <PlayersAvatarsRow players={players} limit={3} bordered />
                    <Text className="text-white/70">{t('match.registered_players', { registered_players: players.length })}</Text>
                </View>
            </View>
        </View>
    </LinearGradient>;
}

const HomeContext = createContext();

function PlayersAvatarsRow({ players, limit = 3, bordered = false, size = 40 }: { players: Player[], limit?: number, bordered?: boolean, size?: number }) {
    return <View className="flex-row gap-1 items-center" style={{ paddingRight: 16 }}>
        {players?.slice(0, limit).map((player) => <PlayerAvatar key={player?.id} color={player?.color} name={player?.name ?? player?.displayname ?? player?.username} bordered={bordered} size={size} />)}
        {players?.length > limit && <PlayerPlaceholderAvatar bordered={bordered}>
            <Text className="font-bold" style={{ color: "#6B6B6B" }}>+{players.length - limit}</Text>
        </PlayerPlaceholderAvatar>}
    </View>;
}

function useHome() {
    return useContext(HomeContext);
}

function HomeProvider({ children }) {
    const nearby = useObservable([,
        {
            match: { id: "1", },
            venue: { id: "2", name: "venueName" },
            start: "2026-04-08T13:00:30.000+02:00",
            distance: { amount: 2, unit: "kilometer" },
            maxPlayersNb: 3,
            playersNb: 10,
            pricePerPlayer: { amount: 9, currency: "EUR" }
        },
        {
            match: { id: "2", },
            venue: { id: "1", name: "venueName" },
            start: "2026-04-09T12:00:30.000+02:00",
            distance: { amount: 48, unit: "kilometer" },
            maxPlayersNb: 10,
            playersNb: 10,
            pricePerPlayer: { amount: 18, currency: "EUR" }
        },
        {
            match: { id: "3", },
            venue: { id: "2", name: "venueName" },
            start: "2026-04-08T12:00:30.000+02:00",
            distance: { amount: 52, unit: "kilometer" },
            maxPlayersNb: 3,
            playersNb: 10,
            pricePerPlayer: { amount: 9, currency: "EUR" }
        },
        {
            match: { id: "4" },
            venue: { id: "3", name: "Urban Arena" },
            start: "2026-04-08T18:30:00.000+02:00",
            distance: { amount: 5, unit: "kilometer" },
            maxPlayersNb: 8,
            playersNb: 8,
            pricePerPlayer: { amount: 12, currency: "EUR" }
        },
        {
            match: { id: "5" },
            venue: { id: "4", name: "City Stadium" },
            start: "2026-04-10T10:00:00.000+02:00",
            distance: { amount: 15, unit: "kilometer" },
            maxPlayersNb: 10,
            playersNb: 7,
            pricePerPlayer: { amount: 20, currency: "EUR" }
        },
        {
            match: { id: "6" },
            venue: { id: "2", name: "venueName" },
            start: "2026-04-08T15:45:00.000+02:00",
            distance: { amount: 1.5, unit: "kilometer" },
            maxPlayersNb: 5,
            playersNb: 4,
            pricePerPlayer: { amount: 8, currency: "EUR" }
        },
        {
            match: { id: "7" },
            venue: { id: "5", name: "Five Zone" },
            start: "2026-04-11T20:00:00.000+02:00",
            distance: { amount: 25, unit: "kilometer" },
            maxPlayersNb: 12,
            playersNb: 10,
            pricePerPlayer: { amount: 16, currency: "EUR" }
        },
        {
            match: { id: "8" },
            venue: { id: "1", name: "venueName" },
            start: "2026-04-08T11:30:00.000+02:00",
            distance: { amount: 3, unit: "kilometer" },
            maxPlayersNb: 6,
            playersNb: 5,
            pricePerPlayer: { amount: 10, currency: "EUR" }
        }
    ]);

    const createScorer = (items) => {
        items = items.filter(i => !!i);
        const distances = items.map(i => i?.distance?.amount);
        const prices = items.map(i => i.pricePerPlayer.amount);
        const times = items.map(i => new Date(i.start).getTime());

        const min = arr => Math.min(...arr);
        const max = arr => Math.max(...arr);

        const bounds = {
            distance: { min: min(distances), max: max(distances) },
            price: { min: min(prices), max: max(prices) },
            time: { min: min(times), max: max(times) },
        };

        const normalize = (value, { min, max }) =>
            max === min ? 1 : 1 - (value - min) / (max - min);

        return (item) => {
            const distanceScore = normalize(item?.distance?.amount, bounds.distance);
            const priceScore = normalize(item?.pricePerPlayer?.amount, bounds.price);
            const timeScore = normalize(new Date(item?.start).getTime(), bounds.time);

            return (
                distanceScore * 0.5 +
                priceScore * 0.3 +
                timeScore * 0.2
            );
        };
    };

    return <Computed>
        {function () {
            const scorer = createScorer(nearby.get());

            return <HomeContext.Provider value={{
                nearby: nearby.get()
                    .sort((a, b) => scorer(b) - scorer(a))
                    .filter(i => new Date(i?.start) > new Date())
            }}>
                {children}
            </HomeContext.Provider>;
        }}
    </Computed>
}


function HomeScreen() {
    return <Screen>
        <HomeHeader />
        <HomeSearch />
        <HomeNextMatch />
        <HomeNearby />
    </Screen>
}

function NearbyScreen() {
    const { nearby } = useHome();

    return <Screen>
        <NearbyScreenHeader />
        <View className="gap-3">
            {nearby.map(props => <NearbyItem key={props?.match?.id} {...props} />)}
        </View>
    </Screen>
}

function NearbyScreenHeader() {
    const navigation = useNavigation();

    return <View className="flex-row items-center justify-start gap-2">
        <HeaderBackButton style={{ margin: 0 }} onPress={() => navigation.goBack()} />
        <Text className="text-xl font-semibold">Nearby</Text>
    </View>
}

function Screen({ children, scrollable = true }: { children: React.ReactNode, scrollable?: boolean }) {
    const Inner = () => <View className="p-5 gap-5 flex-1">
        {children}
    </View>;

    return scrollable ?
        <ScrollView className="flex-1 bg-[#fff]">
            <Inner />
        </ScrollView> : <Inner />;
}

function HomeNearby() {
    const { nearby } = useHome();
    const navigation = useNavigation();

    return nearby.length > 0 && <Section title={t("home.nearby.title")} moreOnPress={() => navigation.navigate('Nearby')} more={t("home.nearby.more")}>
        {nearby.slice(0, 3).map(props => <NearbyItem key={props?.match?.id} {...props} />)}
    </Section>;
}

const NearbyItemContext = createContext({});
const useNearbyByItem = () => useContext(NearbyItemContext);
function NearbyItem(props) {
    const navigation = useNavigation();

    return <NearbyItemContext.Provider value={{
        ...props,
        complete: (props.maxPlayersNb / props.playersNb) === 1
    }}>
        <Pressable onPress={() => navigation.navigate('Match', { screen: 'Details', matchId: props?.match?.id })}>
            <Card>
                <View className="p-4 gap-2">
                    <NearbyItemHeader />
                    <NearbyItemBody />
                </View>
            </Card>
        </Pressable>
    </NearbyItemContext.Provider>
}

function NearbyItemHeader() {
    const { locale } = usePreferences();
    const { venue, complete, start, distance } = useNearbyByItem();

    const rtf = new Intl.RelativeTimeFormat(locale, { style: "long", numeric: "auto" });
    let diff = new Date().getTime() - new Date(start).getTime();
    diff = Math.round(diff / 1000 / 60 / 60 / 24);

    const day = diff < 1 ? rtf.format(-diff, "day") : new Date(start).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
    const hour = new Date(start).toLocaleTimeString(locale, { hour: "numeric", minute: "numeric" });
    const dist = new Intl.NumberFormat(locale, { style: "unit", unit: distance?.unit ?? "kilometer", unitDisplay: "short" }).format(distance?.amount ?? 0);

    return <View className="">
        <View className="flex-row items-center justify-between">
            <Text className="text-[17px] font-bold">{venue?.name}</Text>
            <View className="flex-row items-center px-2 py-1 bg-[#f7f7f5] rounded-full">
                <Text className="text-[13px] text-gray-400">{t(!complete ? `match.opened` : `match.complete`)}</Text>
            </View>
        </View>
        <Text className="text-[13px] text-gray-400">{day} - {hour} - {dist}</Text>
    </View>;
}

function NearbyItemBody() {
    const { locale } = usePreferences();
    const { maxPlayersNb, playersNb, pricePerPlayer, complete } = useNearbyByItem()

    const price = formatPrice(locale, pricePerPlayer.currency, pricePerPlayer.amount);

    return <View className="justify-between items-center flex-row gap-2">
        <Text className="text-[14px] text-gray-400" numberOfLines={1}>{playersNb}/{maxPlayersNb} - {t('prices.per_player', price)}</Text>
        {!complete ?
            <Button title={t('match.reservation')} /> :
            <Button secondary title={t('match.queue')} />}
    </View>
}

function formatPrice(locale: any, currency: any, amount: any) {
    return new Intl.NumberFormat(locale, { style: "currency", currency: currency ?? "EUR" }).format(amount ?? 0);
}

function Button({ title, secondary, outline, className, ...props }: { title: string, secondary?: boolean, outline?: boolean, className?: string }) {
    return <Pressable className={`rounded-full flex-row items-center justify-center gap-2 px-5 py-3 ${secondary ? "hss-secondary" : "hss-primary"} ${outline ? "border hss-outline" : "hss-fill"} ${className}`} {...props}>
        <Text className={`text-inherit`} selectable={false} numberOfLines={1}>{title}</Text>
    </Pressable >;
}

function HomeHeader() {
    return <View className="justify-between items-center flex-row">
        <HomeGreeting />
        <HomeProfilePicture />
    </View>;
}

function HomeGreeting() {
    //TODO: useTranslation, usePreferences

    return <View className="gap-0">
        <Text className="text-[13px] text-gray-400">{t("home.greeting")}</Text>
        <Text className="text-[20px] font-bold text-gray-800 leading-6" numberOfLines={1} style={{}}>Username ⚽</Text>
    </View>;
}

function HomeProfilePicture() {
    //TODO: useProfile
    const { navigate } = useNavigation();

    return <Pressable onPress={() => navigate('Profile')} className="w-10 h-10 rounded-full bg-[#ff6b2b] justify-center items-center">
        <Text className="text-white text-center text-xl">U</Text>
    </Pressable>;
}

function HomeSearch() {
    return <View className="">
        <Input placeholder={t("home.search.placeholder")} />
    </View>;
}

function Input({ placeholder, ...props }: { placeholder?: string } & TextInputProps) {
    return <Pressable className="w-full h-12 rounded-2xl bg-[#f7f7f5] border border-[#d1d1ce] flex-row items-center px-3 gap-3">
        <Icons.Feather name="search" size={20} color={"#757575"} />
        <TextInput placeholder={placeholder} placeholderTextColor={"#757575"} className="w-full h-full outline-none" {...props} />
    </Pressable>;
}

function Select({ onChange, options }: { children: React.ReactNode }) {
    if (!options) return null;

    useEffect(() => {
        onChange(options[0]?.value);
    }, []);

    return <Picker className="w-full h-12 rounded-2xl bg-[#f7f7f5] border border-[#d1d1ce] flex-row items-center px-3 gap-3" onValueChange={onChange}>
        {options.map(({ label, value }, index) => <Picker.Item key={index} label={label} value={value} />)}
    </Picker>;
}

function Section({ title, more, moreOnPress, children }: { title: string, children: React.ReactNode }) {
    return <View className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
            <Text className="text-[17px] font-bold" style={{}}>{title}</Text>
            {more && <Text className="text-[13px] text-[#ff6b2b]" onPress={moreOnPress}>{more}</Text>}
        </View>
        {children}
    </View>;
}

function HomeNextMatch() {
    return <Section title={t("home.nextMatch")}>
        <HomeNextMatchCard />
    </Section>;
}

function Card({ children }) {
    return <Pressable className="w-full rounded-3xl overflow-hidden bg-white" style={{ shadowColor: "#0004", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.25, shadowRadius: 5, elevation: 5 }} pointerEvents="none">
        {children}
    </Pressable>
}

function HomeNextMatchCard() {
    return <Card>
        <HomeNextMatchHeader />
        <HomeNextMatchBody />
    </Card>;
}

function HomeNextMatchHeader() {
    return <View className="bg-[#ff6b2b] p-4">
        <View className="flex-row items-center gap-2">
            <Text className="text-white text-[18px] font-bold flex-1 leading-6" numberOfLines={1}>{"venueName"}</Text>
            <View className="flex-row items-center gap-1 py-1 px-2 bg-[#ff8f5e] rounded-full">
                <Icons.Feather name="clock" size={16} color={"#fff"} />
                <Text className="text-white text-[10px]">{"matchRelativeTime"}</Text>
            </View>
        </View>
        <Text className="text-white text-[14px]">{"matchDate"} - {"matchTime"}</Text>
    </View>
}

function HomeNextMatchBody() {
    return <View className="bg-white p-4 justify-between flex-row items-center">
        <HomeNextMatchPlayersAvatars />
        <View>
            <Text className="text-gray-400 leading-6">X/Y players</Text>
        </View>
    </View>;
}

function HomeNextMatchPlayersAvatars() {
    return <View className="flex-row items-center">
        {[1, 2, 3, 4, 5].map((i) => <HomeNextMatchPlayersAvatar key={i} />)}
    </View>;
}

function HomeNextMatchPlayersAvatar() {
    return <View className="w-10 h-10 aspect-square rounded-full bg-white justify-center items-center" style={{ marginRight: -10, padding: 3, marginLeft: -3 }}>
        <View className="w-full h-full aspect-square rounded-full bg-[#ff6b2b] justify-center items-center">
            <Text className="text-white text-center text-lg">U</Text>
        </View>
    </View>
}

function PlayerAvatar({ name, color, bordered = false, size }: { name: string, color: string, bordered?: boolean, size?: number }) {
    const { textCo } = useAvatarColor(color);
    const sizeStyle = size ? { fontSize: size * 0.5 } : undefined;

    return <PlayerPlaceholderAvatar color={color} bordered={bordered} size={size}>
        <Text style={[{ color: textCo }, sizeStyle]} className="text-center text-lg font-[500]">
            {name?.slice(0, 1).toLocaleUpperCase()}
        </Text>
    </PlayerPlaceholderAvatar>;
}

function useAvatarColor(color: string = "#D1D1CE") {
    const contrast = (Color.contrast(color, "black", "WCAG21") - 1) / 21;
    const threshold = contrast < 0.75;
    const opposite = threshold ? "white" : "black";
    const source = Color.range(color, opposite, { space: "lch", outputSpace: "srgb" });

    const textCo = source?.(threshold ? 0.9 : 0.2)?.toString({ format: "hex" });
    const transpCo = source?.(threshold ? 0.35 : 0.1)?.toString({ format: "hex" });

    return {
        textCo,
        transpCo
    };
}

function PlayerPlaceholderAvatar({ color = "#D1D1CE", children, bordered = false, size }: { color?: string, children: React.ReactNode, bordered?: boolean, size?: number }) {
    const { transpCo } = useAvatarColor(color);
    const sizeStyle = size ? { width: size, height: size } : {};

    return <View className="w-10 h-10 aspect-square rounded-full justify-center items-center" style={[{ marginRight: -16, padding: 0, marginLeft: -0, backgroundColor: color, overflow: "hidden" }, sizeStyle]}>
        <View className="w-full h-full aspect-square rounded-full justify-center items-center" style={bordered && { borderWidth: 3, borderColor: `${transpCo}` }}>
            {children}
        </View>
    </View>
}

function CreationVenueStep() {
    const { venueSearch, setVenueSearch, setCreation, blockNext, creation } = useCreate();

    useEffect(() => {
        blockNext(!creation?.venue);
    }, [creation?.venue]);

    function handleSearch(query) {
        setCreation(x => ({ ...x, venue: undefined }));
        setVenueSearch(query);
    }

    return <View className="gap-2">
        <View className="gap-1">
            <Text className="text-[14px] text-gray-400">{t("create.venue.search")}</Text>
            <Input placeholder={t("create.venue.search")} value={venueSearch.query} onChangeText={handleSearch} />
        </View>
        {venueSearch.results.length > 0 && <View style={{ position: "relative", height: 0, marginBottom: -8 }}>
            <FlatList
                data={venueSearch.results}
                renderItem={({ item }) => <CreationScreenVenueSearchResultItem venue={item} />}
                ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#D1D1CE" }} />}
                style={{ position: "absolute", width: "100%", maxHeight: 200, borderWidth: 1, borderColor: "#D1D1CE", zIndex: 999 }}
                className="px-3 rounded-lg bg-white"
                keyExtractor={(item) => item.id.toString()}
            />
        </View>}
        {/* <View style={{ height: 300, backgroundColor: "#D1D1CE", zIndex: -999 }}></View> */}
    </View>
}

function CreationScreenVenueSearchResultItem({ venue }) {
    const { setVenueSearch, clearVenueResults, setAvailableSports, setCreation } = useCreate();

    const cb = () => {
        setVenueSearch(venue.name);
        clearVenueResults();
        setCreation(x => ({ ...x, venue: { id: venue.id, name: venue.name } }));
        setAvailableSports(venue.sports);
    }

    return <Pressable onPress={cb} className="bg-white p-4 gap-1 flex-row items-center" key={venue.id}>
        <View className="w-10 h-10 aspect-square rounded-full bg-white justify-center items-center" style={{ padding: 3, marginLeft: -3 }}>
            <View className="w-full h-full aspect-square rounded-full bg-[#ff6b2b] justify-center items-center">
                <Text className="text-white text-center text-lg">U</Text>
            </View>
        </View>
        <View className="flex-1">
            <Text className="font-bold leading-6">{venue.name}</Text>
            <Text className="text-[12px] text-gray-400">{venue.address}</Text>
        </View>
    </Pressable>
}

function CreationVenueDate() {
    const { date, setDate } = useCreate();

    return <>
        <View className="gap-5">
            <CreationVenueSportSelector />
            <Calendar activeDate={date ?? new Date()} onSelect={setDate} />
            <CreationVenueDateSlots />
        </View>
    </>
}

function CreationVenueSportSelector() {
    const { availableSports, setSport } = useCreate();

    function oC(sport) {
        setSport(sport);
    }

    return <View className="gap-1">
        <Text className="text-[14px] text-gray-400">{t("create.venue.sport")}</Text>
        <Select options={availableSports?.map(s => ({ label: s, value: s }))} onChange={oC} />
    </View>
}

function CreationVenueDateSlots() {
    const { locale } = useLocale();
    const { dateSlots, date, sport, creation, setCreation, blockNext, getSlots } = useCreate();

    useEffect(() => {
        getSlots(date, sport);
    }, [date, sport]);

    useEffect(() => {
        if (creation.start && creation.end && creation.sport && creation.venue && creation.court) {
            blockNext(false);
        } else {
            blockNext(true);
        }
    }, [creation]);

    const slots = dateSlots.filter(
        ({ start, sport: slotSport, venueId }) => {
            const isSameVenue = creation?.venue?.id === venueId;
            const isSameDay = moment(start).isSame(date, 'day');
            const isSameSport = slotSport === sport;
            return isSameVenue && isSameDay && isSameSport
        }
    ).reduce((acc, slot) => {
        if (!acc[slot.start]) {
            acc[slot.start] = [];
        }

        acc[slot.start].push(slot);

        return acc;
    }, {});

    const formatMoney = (amount, currency) => {
        return amount.toLocaleString(locale, { style: 'currency', currency });
    }

    return <Computed>
        {() => <View className="gap-3">
            {Object.keys(slots).length > 0 ? Object.entries(slots)
                .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
                .map(([start, availableSlots]) => {
                    function FirstColumn() {
                        return <View className="w-10">
                            <Text>{moment(start).format("HH:mm")}</Text>
                        </View>
                    }

                    return <View key={start} className="flex-row items-center gap-1">
                        <FirstColumn />
                        <ScrollView horizontal className="flex-1">
                            {availableSlots.map((slot, i) => {
                                const diff = moment(slot.end).diff(start, "minutes").toString();
                                const duration = moment.duration(diff, 'minutes');

                                const isSelected = new Date(creation.start).getTime() === new Date(start).getTime()
                                    && new Date(creation.end).getTime() === new Date(slot.end).getTime()
                                    && creation.sport === slot.sport
                                    && creation.court.id === slot.courtId
                                    && creation.court.name === slot.courtName;

                                function callback() {
                                    if (isSelected) {
                                        return setCreation(x => ({ ...x, start: null, end: null, sport: null, court: null, pricePerPlayer: null, nbPlayers: null, nbTickets: null }));
                                    }
                                    setCreation(x => ({ ...x, start: start, end: slot.end, sport: slot.sport, court: { id: slot.courtId, name: slot.courtName }, pricePerPlayer: slot.pricePerPlayer, nbPlayers: slot.nbPlayers, nbTickets: 1 }));
                                }

                                const style = isSelected ? { backgroundColor: "#ff6b2b", color: "#fff" } : { backgroundColor: "#f7f7f7" };

                                return <Pressable key={slot.end} onPress={callback} className="items-center gap-1 p-2 rounded-md" style={style}>
                                    <Text className="text-inherit">{`${duration.hours().toString()}h${duration.minutes().toString().padStart(2, "0")}`}</Text>
                                    <Text className="text-[10px] text-inherit">{formatMoney(slot.pricePerPlayer.amount, slot.pricePerPlayer.currency)}</Text>
                                </Pressable>
                            })}
                        </ScrollView>
                    </View>
                }) : <Text className="text-[12px] text-gray-400">{t("create.venue.noSlot")}</Text>}
        </View>}
    </Computed>
}

function CreationVenueDetails() {
    const { creation, setCreation } = useCreate();

    const levelSettings = [
        { label: "Beginner", value: "beginner" },
        { label: "Intermediate", value: "intermediate" },
        { label: "Advanced", value: "advanced" },
    ];

    return <>
        <View className="gap-1">
            <Text className="text-[14px] text-gray-400">{t("create.match.description")}</Text>
            <Input placeholder={t("create.match.description")} value={creation.description} onChangeText={v => setCreation(x => ({ ...x, description: v }))} multiline />
        </View>

        <View className="gap-1">
            <Text className="text-[14px] text-gray-400">{t("create.match.level")}</Text>
            <Select options={levelSettings} onChange={v => setCreation(x => ({ ...x, level: v }))} />
        </View>
    </>
}

function CreationVenueCheckout() {
    const { locale } = usePreferences();
    const { creation, resetState, checkout, paid, setCheckout, setPaid, blockPrev } = useCreate();
    const { navigate } = useNavigation();

    const duration = moment(creation.end).diff(creation.start, "minutes", true);
    const durationHours = Math.floor(duration / 60);
    const durationMinutes = duration % 60;

    function endCheckoutCb() {
        console.log("endCheckoutCb");
        resetState();
        navigate("Home");
    }

    useEffect(function () {
        blockPrev(paid);
    }, [checkout, paid]);

    return <>
        {(!paid && !checkout) && <View className="gap-4">
            <View className="gap-1">
                <Text className="text-[14px] text-gray-400">{t("create.match.venue")}</Text>
                <Text>{creation.venue?.name}</Text>

                <Text className="text-[14px] text-gray-400">{t("create.match.court")}</Text>
                <Text>{creation.court?.name}</Text>

                <Text className="text-[14px] text-gray-400">{t("create.match.sport")}</Text>
                <Text>{creation.sport}</Text>

                <Text className="text-[14px] text-gray-400">{t("create.match.date")}</Text>
                <Text>{new Intl.DateTimeFormat("fr").format(new Date(creation.start))}</Text>

                <Text className="text-[14px] text-gray-400">{t("create.match.duration")}</Text>
                <Text>{new Intl.DurationFormat("fr", { style: "long", hoursDisplay: "auto", minutesDisplay: "always" }).format({
                    minutes: durationMinutes,
                    hours: durationHours
                })}</Text>

                <Text className="text-[14px] text-gray-400">{t("create.match.pricePerPlayer")}</Text>
                <Text className="font-bold">{new Intl.NumberFormat(locale || "fr", { style: "currency", currency: creation.pricePerPlayer?.currency }).format(creation.pricePerPlayer.amount)}</Text>

                <Text className="text-[14px] text-gray-400">{t("create.match.maxNbPlayers")}</Text>
                <Text>{creation.nbPlayers}</Text>

                <Text className="text-[14px] text-gray-400">{t("create.match.setNbTicket")}</Text>
                <CreationVenueCheckoutNbTickets />

                <View>
                    <Text className="text-[14px] text-gray-400">{t("create.match.totalPrice")}</Text>
                    <Text className="text-2xl font-bold">{new Intl.NumberFormat(locale || "fr", { style: "currency", currency: creation.pricePerPlayer?.currency }).format(creation.nbTickets * creation.pricePerPlayer.amount)}</Text>
                </View>
            </View>
            <Button title={t("create.match.checkout")} onPress={() => setCheckout(true)} />
        </View>}

        {(!paid && checkout) && <HolaStripeProvider
            locale={locale || "fr"}
            venue={creation.venue.id}
            currency={creation.pricePerPlayer.currency}
            amount={creation.pricePerPlayer.amount}
            quantity={creation.nbTickets}
            onComplete={(sessionId) => {
                setPaid(true);
                // createMatch
            }}>
            <View style={{ height: "50dvh", borderColor: "#f7f7f7" }} className="p-4 rounded-xl bg-grey-100 shadow border border-grey-100 overflow-hidden">
                <ScrollView>
                    <EmbeddedCheckout />
                </ScrollView>
            </View>
        </HolaStripeProvider>}

        {paid && <View className="gap-4">
            <Text className="text-2xl font-bold">{t("create.match.paid")}</Text>
            <Button title={t("create.match.back")} onPress={endCheckoutCb} />
        </View>}
    </>
}

function CreationVenueCheckoutNbTickets() {
    const { creation, setCreation } = useCreate();

    const activeMinus = creation.nbTickets === 1 ? { backgroundColor: "#f7f7f7", color: "gray" } : { backgroundColor: "#ff6b2b", color: "#fff" };
    const activePlus = creation.nbTickets === creation.nbPlayers ? { backgroundColor: "#f7f7f7", color: "gray" } : { backgroundColor: "#ff6b2b", color: "#fff" };

    return <View className="flex-row items-center gap-2">
        <Pressable className="w-8 h-8 items-center justify-center rounded-md" style={activeMinus} disabled={creation.nbTickets === 1} onPress={() => setCreation(x => ({ ...x, nbTickets: Math.max(1, (x.nbTickets ?? 0) - 1) }))}>
            <Text className="text-inherit text-lg">-</Text>
        </Pressable>
        <Text className="text-2xl">{creation.nbTickets}</Text>
        <Pressable className="w-8 h-8 items-center justify-center rounded-md" style={activePlus} disabled={creation.nbTickets === creation.nbPlayers} onPress={() => setCreation(x => ({ ...x, nbTickets: Math.min((x.nbTickets ?? 0) + 1, x.nbPlayers) }))}>
            <Text className="text-inherit text-lg">+</Text>
        </Pressable>
    </View>;
}

const steps = [
    { label: "venue", component: CreationVenueStep },
    { label: "date", component: CreationVenueDate },
    { label: "details", component: CreationVenueDetails },
    { label: "checkout", component: CreationVenueCheckout },
];

const CreateContext = createContext();
export function useCreate() {
    return useContext(CreateContext);
};

const persistOptions = configureSynced({
    persist: {
        plugin: observablePersistAsyncStorage({
            AsyncStorage
        })
    }
});

const initSt = {
    stepIndex: 0,
    canNext: false,
    canPrev: true,
    venueSearch: {
        query: "",
        results: []
    },
    availableSports: [],
    sport: null,
    date: moment().locale('fr').startOf('day').format('YYYY-MM-DD'),
    dateSlots: [],
    creation: {},
    paid: false,
    checkout: false
};

const state = observable({
    ...initSt
});

syncObservable(state, persistOptions({
    persist: {
        name: 'createProviderStore',
    }
}))

function CreateProvider({ children }: { children: React.ReactNode }) {
    state.venueSearch.query.onChange(({ value: query }) => {
        if (query.length > 0) {
            state.venueSearch.results.set([
                {
                    id: "1",
                    name: "Venue 1",
                    address: "Address 1",
                    sports: ["football5", "football8", "tennis", "basketball", "volleyball"],
                },
            ]);
        }
    });

    function getSlots(date, sport) {
        const slots = [
            { venueId: "1", start: "2026-04-13T14:00:00.000Z", end: "2026-04-13T14:45:00.000Z", courtId: "1", courtName: "Court 1", sport: "football5", nbPlayers: 10, pricePerPlayer: { currency: "EUR", amount: 7.5 } },
            { venueId: "1", start: "2026-04-13T12:00:00.000Z", end: "2026-04-13T12:45:00.000Z", courtId: "1", courtName: "Court 1", sport: "football5", nbPlayers: 10, pricePerPlayer: { currency: "EUR", amount: 7.5 } },
            { venueId: "1", start: "2026-04-13T12:00:00.000Z", end: "2026-04-13T13:00:00.000Z", courtId: "1", courtName: "Court 1", sport: "football5", nbPlayers: 10, pricePerPlayer: { currency: "EUR", amount: 10 } },
            { venueId: "2", start: "2026-04-13T12:00:00.000Z", end: "2026-04-13T13:00:00.000Z", courtId: "1", courtName: "Court 1", sport: "football5", nbPlayers: 10, pricePerPlayer: { currency: "EUR", amount: 10 } },
            { venueId: "1", start: "2026-04-14T14:00:00.000Z", end: "2026-04-14T15:00:00.000Z", courtId: "1", courtName: "Court 1", sport: "football8", nbPlayers: 16, pricePerPlayer: { currency: "EUR", amount: 10 } },
        ];

        state.dateSlots.set(slots);
    }

    return <Computed>
        {() => {
            const nextStep = () => state.stepIndex.set(x => Math.min(x + 1, steps.length - 1));
            const prevStep = () => state.stepIndex.set(x => Math.max(x - 1, 0));
            const canGoBack = state.canPrev.get() && state.stepIndex.get() > 0;
            const canGoNext = state.canNext.get() && state.stepIndex.get() < steps.length - 1;

            return <CreateContext.Provider value={{
                creation: state.creation.get(),
                setCreation: state.creation.set,
                nextStep,
                prevStep,
                canGoBack,
                canGoNext,
                currentStep: steps[state.stepIndex.get()],
                steps,
                stepIndex: state.stepIndex.get(),
                venueSearch: {
                    query: state.venueSearch.query.get(),
                    results: state.venueSearch.query.get().length === 0 ? [] : state.venueSearch.results.get()
                },
                setVenueSearch: state.venueSearch.query.set,
                blockNext: (x) => state.canNext.set(!x),
                blockPrev: (x) => state.canPrev.set(!x),
                clearVenueResults: () => state.venueSearch.results.set([]),
                availableSports: state.availableSports.get(),
                setAvailableSports: state.availableSports.set,
                dateSlots: state.dateSlots.get(),
                setSport: state.sport.set,
                date: state.date.get(),
                sport: state.sport.get(),
                setDate: state.date.set,
                resetState: () => {
                    console.log("resetState", initSt);
                    state.set(initSt);
                    state.creation.set({});
                    state.paid.set(false);
                    state.checkout.set(false);
                    state.stepIndex.set(0);
                    state.venueSearch.query.set("");
                    state.venueSearch.results.set([]);
                    state.availableSports.set([]);
                    state.dateSlots.set([]);
                    state.sport.set(null);
                    state.date.set(moment().format("YYYY-MM-DD"));
                },
                checkout: state.checkout.get(),
                setCheckout: state.checkout.set,
                paid: state.paid.get(),
                setPaid: state.paid.set,
                getSlots,
            }}>
                {children}
            </CreateContext.Provider>;
        }}
    </Computed>;
}

function CreateScreen() {
    return <>
        <View className="flex-1 relative">
            <Screen>
                <CreateScreenHeader />
                <CreateScreenBody />
            </Screen>
            {/* <CreateScreenBottom /> */}
        </View>
        <CreateScreenFooter />
    </>
}

function CreateScreenHeader() {
    const navigation = useNavigation();
    const { steps, stepIndex, currentStep } = useCreate();

    return <View className="gap-3">
        <View className="flex-row items-center gap-2">
            <Pressable style={{ margin: 0 }} onPress={() => navigation?.pop() || navigation?.goBack()}>
                <Icons.Feather name="arrow-left" size={24} color={"#ff6b2b"} />
            </Pressable>
            <Text className="text-2xl font-bold leading-6">{t("create.title")}</Text>
        </View>
        <View>
            <View className="w-full gap-1 flex-row">
                {steps.map((step, i) => <View key={i} className="flex-1 items-center gap-1 rounded-full" style={{ height: 5, backgroundColor: i <= stepIndex ? "#ff6b2b" : "#D1D1CE" }} />)}
            </View>
            {currentStep?.label && <Text className="text-[14px] text-gray-400">Etape {stepIndex + 1}/{steps.length} - {t(`create.steps.${currentStep?.label}`)}</Text>}
        </View>
    </View>
}

function CreateScreenBody() {
    const { currentStep } = useCreate();

    return <View className="flex-1 relative">
        {currentStep?.component && <currentStep.component />}
    </View>
}

function CreateScreenBottom() {
    const { creation } = useCreate();
    const { venue = null, start, end, court, sport } = creation;

    console.log({ venue, start, end, sport, court });

    return (venue) && <View className="p-4" style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#0000" }}>
        <View className="bg-[#ff6b2b] p-4 rounded-lg shadow-md">
            {venue && <Text className="text-white">{t("create.state.venue")}: {venue?.name}</Text>}
            {sport && <Text className="text-white">{t("create.state.sport")}: {sport}</Text>}
            {start && <Text className="text-white">{t("create.state.start")}: {new Date(start).toUTCString()}</Text>}
            {end && <Text className="text-white">{t("create.state.end")}: {new Date(end).toUTCString()}</Text>}
            {court && <Text className="text-white">{t("create.state.court")}: {court?.name}</Text>}
        </View>
    </View>
}

function CreateScreenFooter() {
    const { canGoNext, canGoBack, nextStep: next, prevStep: back } = useCreate();

    return (canGoBack || canGoNext) && <View className="gap-4 flex-row px-5 py-3 items-center" style={{ borderTopWidth: 1, borderColor: "#ccc" }}>
        {canGoBack && <Button outline title={t(`create.back`)} onPress={back} />}
        {canGoNext && <Button className={"flex-1"} title={`${t(`match.next`)}`} onPress={next}></Button>}
    </View>
}

function Calendar({ blockPast = true, onSelect, activeDate: defaultActiveDate }: any) {
    const { creation } = useCreate();
    const [activeDate, setActiveDate] = useState(defaultActiveDate ?? new Date());
    const [todayDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(moment().month());
    const [weekDays, setWeekDays] = useState([]);
    const [quadri, setQuadri] = useState([]);

    function CalendarDay({ activeDate, todayDate, date }: any) {
        const activeMonth = moment(date).month() === currentMonth;
        const dayNb = new Intl.DateTimeFormat("fr", { day: "numeric" }).format(new Date(date)).padStart(2, "0");
        const active = moment(date).isSame(activeDate, "day");
        const today = moment(date).isSame(todayDate, "day");
        const isInPast = moment(date).isBefore(todayDate, "day");

        const bgStyle = active ? { backgroundColor: "#ff6b2b" } : today ? { backgroundColor: "#FF8F5E" } : {};

        const callback = (): void => {
            setCurrentMonth(moment(date).month());
            setActiveDate(date);

            if (onSelect) {
                onSelect(date);
            }
        }

        const isSelectedSlotThisDay = creation?.start && moment(creation?.start).isSame(date, "day");

        return <Pressable onPress={callback} className="flex-1 items-center justify-center rounded-full aspect-square relative" style={{ height: 35, opacity: isInPast && blockPast ? 0.2 : activeMonth ? 1 : 0.2 }} pointerEvents={!(isInPast && blockPast) ? "auto" : "none"}>
            <View className="items-center justify-center rounded-full aspect-square" style={[{ height: 35, width: 35 }, bgStyle]}>
                <Text style={{ color: active ? "#fff" : today ? "#000" : "#000" }} className="text-[12px]">{dayNb}</Text>
            </View>
            {isSelectedSlotThisDay && <View className="absolute top-0 right-0 rounded-full aspect-square items-center justify-center" style={{ height: 15, width: 15, backgroundColor: "yellowgreen" }}>
                <Icons.AntDesign name="check" size={10} color={"#fff"} />
            </View>}
        </Pressable>
    }

    function month(m, y) {
        const startDate = moment([y, m, 1]).startOf("isoWeek");
        const endDate = moment([y, m, 1]).endOf("month").endOf("isoWeek");

        setWeekDays([...Array(7)].map((_, i) => startDate.clone().add(i, "days").format("ddd")));
        const dates = [...Array(endDate.diff(startDate, "days") + 1)].reduce((acc, _, i) => {
            const date = startDate.clone().add(i, "days");
            const weekNb = date.isoWeek();

            return {
                ...acc,
                [`${weekNb}`]: [...(acc[`${weekNb}`] || []), date.toISOString()]
            };
        }, []);

        setQuadri(dates);
    }

    useEffect(function () {
        month(currentMonth, moment().year());
    }, [currentMonth]);

    return <View className="flex-1 p-5 bg-gray-100 rounded-2xl gap-1">
        <View className="flex-row items-center justify-between">
            <Pressable onPress={() => setCurrentMonth(currentMonth - 1)}>
                <Icons.Feather name="chevron-left" size={24} color={"#ff6b2b"} />
            </Pressable>
            <Text className="font-bold leading-6">{moment().month(currentMonth).format("MMMM YYYY")}</Text>
            <Pressable onPress={() => setCurrentMonth(currentMonth + 1)}>
                <Icons.Feather name="chevron-right" size={24} color={"#ff6b2b"} />
            </Pressable>
        </View>
        <View className="flex-row items-center" style={{ height: 40 }}>
            {weekDays.map((day, i) => <View style={{ flex: 1 }} className="items-center justify-center">
                <Text key={i} className="text-center font-semibold">{day}</Text>
            </View>)}
        </View>
        {Object.values(quadri).map((week, i) => <View key={i} className="flex-row">
            {week.map((date, i) => <CalendarDay key={i} activeDate={activeDate} todayDate={todayDate} date={date} />)}
        </View>)}
    </View>
}

const socialTabs = observable([
    { key: "friends", title: t("social.friends"), active: true },
    { key: "messages", title: t("social.messages") },
    { key: "activity", title: t("social.activity") },
]);
const currentSocialTab = observable(() => socialTabs.find(tab => tab.active.get())?.key.get() || "friends");
const setActiveSocialTab = (key: string) => socialTabs.set(x => x.map(tab => ({ ...tab, active: tab.key === key })));

function SocialScreen() {
    return (
        <Screen scrollable={false}>
            <Text className="text-2xl font-bold text-gray-800 leading-6">{t("social.title")}</Text>
            <SocialScreenTabsHeader />
            <View className="flex-1">
                <Switch value={currentSocialTab}>
                    {{
                        "friends": () => <SocialScreenFriends />,
                        "messages": () => <SocialScreenMessages />,
                        "activity": () => <SocialScreenActivity />
                    }}
                </Switch>
            </View>
        </Screen>
    );
}

function ToggleSwitch({ value, onChange }: { value: boolean, onChange: (value: boolean) => void }) {
    const statePositionStyle = !value ? { right: 0 } : { left: 0 };

    return <Pressable onPress={() => onChange(!value)} className="flex-row items-center justify-center relative mx-2">
        <View className={`w-8 h-4 rounded-full ${!value ? "bg-[#ff6b2b]" : "bg-[#D1D1CE]"}`} />
        <View className={`absolute w-4 h-4 rounded-full ${value ? "bg-[#ff6b2b]" : "bg-[#D1D1CE]"}`} style={[statePositionStyle, { transform: [{ scale: 1.25 }] }]} />
    </Pressable>;
}

function SocialScreenFriends() {
    const [state, setState] = useState(false);

    return <View className="flex-1 gap-3">
        <ScrollView className="flex-1" contentContainerClassName="items-stretch justify-start gap-3">
            <View className="flex-row items-center justify-between">
                <Text className="text-[#6B6B6B]">{t("social.lookingForAMatch")}</Text>
                <ToggleSwitch value={state} onChange={setState} />
            </View>
            <ScreenSection title={t("social.requests")}>
                <SocialScreenFriendRequests />
            </ScreenSection>
            <ScreenSection title={t("social.friends")}>
                <SocialScreenFriendsList />
            </ScreenSection>
        </ScrollView>
        <SocialScreenFriendSearch />
    </View>;
}

function SocialScreenFriendRequests() {
    const requests = [
        { type: "match", user: { displayname: "John Doe", color: "hotpink" }, status: "pending", start: "2026-04-22T19:30:00.000Z", venue: { name: "Venue 1" } }
    ];
    const { locale } = usePreferences();

    return requests.map((request, i): JSX.Element => {
        if (request.type === "match") {
            const diff = new Date().getTime() - new Date(request?.start).getTime();
            const relativeDay = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-Math.round(diff / 1000 / 60 / 60 / 24), "day");
            const hour = new Date(request?.start).toLocaleTimeString(locale, { hour: "numeric", minute: "numeric" });

            return <Pressable key={i} className="flex-row items-center gap-3 p-3 bg-[#f7f7f5] rounded-2xl">
                <View>
                    <PlayersAvatarsRow players={[{ color: request?.user?.color, name: request?.user?.displayname }]} />
                </View>
                <View className="flex-1">
                    <Text numberOfLines={1} className="font-bold">{t("social.matchInvite", { user: request?.user?.displayname })}</Text>
                    <Text className="text-gray-400" numberOfLines={2}>
                        {relativeDay} ·
                        {request?.venue?.name} ·
                        {hour}
                    </Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <Button title={t("yes")} />
                    <Button secondary title={t("no")} />
                </View>
            </Pressable>
        }
    });
}

function formatLastOnline(locale: string, date: Date | string): string {
    const diff = Math.abs(new Date().getTime() - new Date(date).getTime());
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    console.log({
        seconds,
        minutes,
        hours,
        days,
        weeks,
        months,
        years
    })

    if (seconds < 60) return rtf.format(-seconds, 'second');
    if (minutes < 60) return rtf.format(-minutes, 'minute');
    if (hours < 24) return rtf.format(-hours, 'hour');
    if (days < 7) return rtf.format(-days, 'day');
    if (weeks < 4) return rtf.format(-weeks, 'week');
    if (months < 12) return rtf.format(-months, 'month');
    return rtf.format(-years, 'year');
}

function SocialScreenFriendsList() {
    const friends = [
        {
            user: { displayname: "John Doe", color: "hotpink" },
            lookingForMatch: true,
            lastOnline: "2026-04-22T19:30:00.000Z",
            nextMatch: { start: "2026-04-22T19:30:00.000Z", venue: { name: "Venue 1" } },
        },
        {
            user: { displayname: "OTTOC4R", color: "crimson" },
            lookingForMatch: true,
            lastOnline: "2026-04-22T19:30:00.000Z",
        },
        {
            user: { displayname: "Swii", color: "dodgerblue" },
            lastOnline: "2026-04-22T19:30:00.000+02:00",
        },
    ]
    const { locale } = usePreferences();

    return <FlatList
        data={friends}
        renderItem={function ({ item }) {
            let description;
            if (item?.lastOnline) {
                description = `${t("social.lastOnline")} : ${formatLastOnline(locale, item?.lastOnline)}`;
            }
            if (item?.lookingForMatch) description = t("social.lookingForAMatch");
            if (item?.nextMatch) {
                const diff = new Date().getTime() - new Date(item?.nextMatch?.start).getTime();
                const relativeDay = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-Math.round(diff / 1000 / 60 / 60 / 24), "day");
                const hour = new Date(item?.nextMatch?.start).toLocaleTimeString(locale, { hour: "numeric", minute: "numeric" });
                description = `${t("social.nextMatch", { date: relativeDay })} · ${hour}`;
            }

            return <Pressable className="flex-row items-center gap-3 p-3">
                <View>
                    <PlayersAvatarsRow players={[{ color: item?.user?.color, name: item?.user?.displayname }]} />
                </View>
                <View className="flex-1">
                    <Text numberOfLines={1} className="font-bold">{item?.user?.displayname}</Text>
                    <Text className="text-gray-400" numberOfLines={2}>
                        {description}
                    </Text>
                </View>
                <Button secondary title={t("social.sendRequest")} />
            </Pressable>;
        }}
    />
}

function SocialScreenMessages() {
    return <Text>Messages</Text>;
}

function SocialScreenActivity() {
    return <Text>Activity</Text>;
}

function SocialScreenTabsHeader() {
    const activeTabStyle = { borderBottomWidth: 2, borderBottomColor: "#ff6b2b" };
    const activeTabTextStyle = { color: "#ff6b2b", fontWeight: "bold" };
    const inactiveTabStyle = { borderBottomWidth: 2, borderBottomColor: "#D1D1CE" };
    const inactiveTabTextStyle = { color: "#6B6B6B" };

    return <Computed>
        {() => <View className="flex-row items-center justify-between">
            {socialTabs.get().map((tab, i) => (
                <Pressable key={i}
                    className="flex-1 items-center justify-center"
                    style={tab.active ? activeTabStyle : inactiveTabStyle}
                    onPress={() => setActiveSocialTab(tab.key)}
                >
                    <Text key={i} className="py-3" style={tab.active ? activeTabTextStyle : inactiveTabTextStyle}>{tab.title}</Text>
                </Pressable>
            ))}
        </View>}
    </Computed>;
}

function SocialScreenFriendSearch() {
    const [search, setSearch] = useState("");
    const [active, setActive] = useState(false);

    return <View className="flex flex-row items-center justify-between bg-[#f7f7f5] p-4 rounded-2xl gap-3">
        <View className="flex-1">
            <Input style={{}} placeholder={t("social.search.placeholder")} onFocus={() => setActive(true)} onBlur={() => setActive(false)} value={search} onChangeText={setSearch} />
        </View>
        <Button title={t("social.addFriend")} />
    </View>;
}