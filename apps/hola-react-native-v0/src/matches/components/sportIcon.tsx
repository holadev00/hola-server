import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export const sportIcon = (size = 24, color, sport) => ({
    football: <Ionicons name="football" size={(size/24)*25} color={color} />,
    basketball: <MaterialCommunityIcons name="basketball" size={size} color={color} />,
    tennis: <MaterialCommunityIcons name="tennis-ball" size={size} color={color} />,
})?.[sport!]