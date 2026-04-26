import { MaterialCommunityIcons } from '@expo/vector-icons';

export function rightHeaderCog(navigation) {
    return ({
        headerRight(props) {
            return (
                <MaterialCommunityIcons
                    name="cog-outline"
                    size={28}
                    color="black"
                    onPress={() => navigation.navigate('CustomerSettings')} />
            );
        },
        headerRightContainerStyle: { marginRight: 16 }
    });
}