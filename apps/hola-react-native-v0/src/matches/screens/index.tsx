import { ScrollView, View } from "react-native";
import Button from "@hola/ui/components/Button";
import { useTranslation } from "react-i18next";
import { spacing } from "@hola/ui";
import { Computed } from "@legendapp/state/react";
import Title from "@hola/ui/components/Title";
import { Ionicons } from "@expo/vector-icons";
import { UserUpcomingMatches } from "../components/UserUpcomingMatches";
import { FrontPageUpcomingMatches } from "../components/FrontPageUpcomingMatches";
import { NearVenues } from "../components/NearVenues";
import { UserFavoritesVenues } from "../components/UserFavoritesVenues";

export function CustomerMatchesScreen({ navigation }) {
    const { t } = useTranslation();

    return <Computed>
        {function () {
            return <View style={{ flex: 1, position: 'relative', padding: spacing.md }}>
                <ScrollView style={{ flex: 1 }}>
                    <Title>{t('matches.user.upcoming') || "Tes prochains matchs"}</Title>
                    <UserUpcomingMatches />

                    <Title>{t('matches.venues.favorites') || "Lieux favoris"}</Title>
                    <UserFavoritesVenues />

                    <Title>A la une</Title>
                    <FrontPageUpcomingMatches />

                    <Title>Lieux les plus proches</Title>
                    <NearVenues />
                </ScrollView>

                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: spacing.md }}>
                    <Button onPress={() => navigation.navigate('CustomerMatchesSearch')}>
                        <Ionicons name="search" size={14} style={{ marginRight: spacing.xs }} />
                        Rechercher un match
                    </Button>
                </View>
            </View>
        }}
    </Computed>;
}

