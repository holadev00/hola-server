import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export function LayoutHeader({ title, right }: { title?: string, right?: React.ReactNode }) {
    const navigation = useNavigation();
    return (
        <View
            style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                height: 50,
            }}
        >
            <Pressable style={{ position: "absolute", left: 16 }} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Index")}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>{title}</Text>
            {right}
        </View>
    );
}