import { Tab } from "@hola/navigation/tab";
import { MatchesByVenueScreen } from "../screens/venue";
import { MatchCreationScreen } from "../screens/create/date/index";
import colors from "@hola/ui/colors";
import { useRoute } from "@react-navigation/native";
import { VenueScreenProvider } from "../contexts/venuesScreen";
import { MatchCreationOptionScreen } from "../screens/create/options";
import { MatchCreationCheckoutScreen } from "../screens/create/checkout";
import { MatchDetailsScreen } from "../screens/details";
import { getTabScreenOptions } from "@hola/navigation/tabBar";
import { MatchRequestScreen } from "../screens/request";

export function MatchesByVenueStack() {
    const { params } = useRoute();

    return <VenueScreenProvider params={params}>
        <Tab.Navigator
            screenOptions={({ route }) => ({
                ...getTabScreenOptions({ route, titlePrefix: 'venues.matches' }),
                sceneStyle: { backgroundColor: colors.background },
                tabBarStyle: { display: 'none' }
            })}>
            <Tab.Screen
                name="Index"
                component={MatchesByVenueScreen} />
            <Tab.Screen
                name="Create"
                component={MatchesCreationStack} />
            <Tab.Screen
                name="Details"
                component={MatchDetailsScreen}
                options={{
                    tabBarItemStyle: { display: 'none' },
                    sceneStyle: { backgroundColor: colors.background },
                }} />
            <Tab.Screen
                name="Request"
                component={MatchRequestScreen}
                options={{
                    tabBarItemStyle: { display: 'none' },
                    sceneStyle: { backgroundColor: colors.background },
                }} />
        </Tab.Navigator>
    </VenueScreenProvider>;
}


export function MatchesCreationStack() {
    return <Tab.Navigator
        screenOptions={{
            headerShown: false,
            sceneStyle: { backgroundColor: colors.background },
            tabBarStyle: { display: 'none' }
        }}>
        <Tab.Screen
            name="IndexCrea"
            component={MatchCreationScreen} />
        <Tab.Screen
            name="Options"
            component={MatchCreationOptionScreen} />
        <Tab.Screen
            name="Checkout"
            component={MatchCreationCheckoutScreen} />
    </Tab.Navigator>;
}