import { useNavigation } from '@react-navigation/native';

export function useMatchesScreensLinks(venue) {
    const navigation = useNavigation();

    return {
        // /matches
        indexScreen: () =>
            navigation.navigate('CustomerMatches'),

        // /matches/:venue/create
        createScreen: () =>
            navigation.navigate('CustomerMatchCreationDate', {
                venue,
            }),

        // /matches/:venue/create/options
        createOptionsScreen: () =>
            navigation.navigate('CustomerMatchCreationOptions', {
                venue,
            }),

        // si tu as un écran checkout plus tard
        createCheckoutScreen: () =>
            navigation.navigate('CustomerMatchCreationCheckout', {
                venue,
            }),

        // /matches/:venue
        venueScreen: () =>
            navigation.navigate('CustomerMatchesByVenue', {
                venue,
            }),

        // /matches/:match
        detailsScreen: (match) =>
            navigation.navigate('CustomerMatchDetails', {
                match,
            }),

        // /matches/:match/request
        requestScreen: (match) =>
            navigation.navigate('CustomerMatchRequest', {
                match,
            }),
    };
}
