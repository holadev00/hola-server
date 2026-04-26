import { Tab } from "@hola/navigation/tab";
import { MatchesByVenueStack } from "./venues";
import { MatchesScreen } from "../screens";
import colors from "@hola/ui/colors";
import { getTabScreenOptions } from "@hola/navigation/tabBar";

export function MatchesStack() {
    return <Tab.Navigator
        screenOptions={({ route }) => ({
            ...getTabScreenOptions({ route }),
            sceneStyle: { backgroundColor: colors.background },
            tabBarStyle: { display: 'none' }
        })}>
        <Tab.Screen
            name="Index"
            component={MatchesScreen}
            options={({ route }) => ({

            })}/>
        <Tab.Screen
            name="Venue"
            component={MatchesByVenueStack}
            options={{
                headerShown: false,
                tabBarItemStyle: { display: 'none' },
            }} />
    </Tab.Navigator>;
}