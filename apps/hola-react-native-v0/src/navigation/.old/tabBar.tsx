import { Pressable, Text, View } from "react-native";
import { AntDesign, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons, Octicons } from "@expo/vector-icons";
import { Link } from "@react-navigation/native";
import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import colors from "@hola/ui/colors";

export const tabBarStyle = { padding: 0, gap: 0, backgroundColor: 'transparent', borderTopWidth: 0, height: 75, elevation: 0, shadowOpacity: 0 };

export function getTabScreenOptions({ route, t = (t) => t, titlePrefix }): BottomTabNavigationOptions {
    return ({
        headerStyle: { shadowOpacity: 0, elevation: 0, backgroundColor: colors.background, borderBottomWidth: 0 },
        headerTitle: t(`tabs${titlePrefix ? '.' + titlePrefix : ''}.${route.name.toLocaleLowerCase()}`),
        headerTitleAlign: 'center',
        headerLeft: (options) => {
            return <Pressable {...options} style={[{ marginLeft: 16 }, options.style]}>
                <FontAwesome6 name="chevron-left" size={21} color={colors.foreground} onPress={() => { history.back(); }} />
            </Pressable>
        },
        headerRight: () => <Link screen="Settings" style={{ marginRight: 16 }}>
            <MaterialCommunityIcons name="cog-outline" size={24} color="black" />
        </Link>,
        headerTitleStyle: { fontSize: 16, fontWeight: '500', color: 'black' },
        tabBarStyle: tabBarStyle,
        tabBarLabelPosition: 'below-icon',
        tabBarItemStyle: { padding: 0, paddingTop: 5, justifyContent: 'center', alignItems: 'center', gap: 0 },
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ ...props }) => <HomeTabsIcon route={route} {...props} />,
        tabBarActiveTintColor: 'black',
        tabBarLabel: function ({ focused, color, children }) {
            const pageName = children.toLocaleLowerCase();
            return <Text style={{ color, fontSize: 11, lineHeight: 14 }}>{t(`tabs.${pageName}`)}</Text>;
        },
        animation: "none",
        lazy: true,
        sceneStyle: { backgroundColor: colors.background },
    });
}

export function HomeTabsIcon({ route, focused, color, size }: any) {
    const icons = {
        Home: { library: Octicons, name: focused ? 'home-fill' : 'home', },
        Matches: { library: Ionicons, name: focused ? 'football' : 'football-outline', },
        Profile: { library: Ionicons, name: focused ? 'person' : 'person-outline', },
        Search: { library: Ionicons, name: 'search', },
        Settings: { library: MaterialCommunityIcons, name: focused ? 'cog' : 'cog-outline', },
        Login: { library: AntDesign, name: focused ? 'login' : 'login', },
    };

    const icon = icons?.[route.name];

    if (!icon) {
        return <Text>{route.name}</Text>;
    }

    const { library: Library = Ionicons, name = 'home' } = icon;

    if (!Library) {
        return <Text>{route.name}</Text>;
    }

    return <Library name={name} size={22} color={color} />;
}