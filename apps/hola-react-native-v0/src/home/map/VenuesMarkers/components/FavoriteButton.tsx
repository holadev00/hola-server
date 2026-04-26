import { View as View_ } from "react-native";

import { AntDesign } from '@expo/vector-icons';
import { Computed } from "@legendapp/state/react";

import colors from "@hola/ui/colors";
import { favorites } from "../state";
import { useVenuesSocket } from "../hooks/useVenuesSocket";

export function FavoriteButton({ id }) {
    const socket = useVenuesSocket();

    return <Computed>
        {() => {
            const liked = favorites?.get()?.[id]

            const onPress = () => {
                socket.emit('VENUES/favorite/toggle', id, liked, favorites?.[id]?.set);
            }

            return <View_ style={{ height: 32, width: 32, alignItems: "center", justifyContent: "center" }}>
                <AntDesign
                    name="star"
                    size={24}
                    color={liked ? colors.primary : "#ccc"}
                    onPress={onPress} />
            </View_>;
        }}
    </Computed>
}