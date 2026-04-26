import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { setStep$ } from "./venue/state";
import { decimalToDMS } from "./functions/decimalToDMS";
import colors from "@hola/ui/colors";
import { extMapEvents } from "../map/extMapEvents";

export function HomeBottomSheetHeader({ title, changeButton, position }: { title: string, position: any }) {
    const { t } = useTranslation();

    return <View style={{ flex: 1 }} onLayout={setStep$.bind(null, "header")}>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                {title}
            </Text>
            {changeButton && changeButton}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Feather name="map-pin" size={14} color="#aaa" />
            <Text style={{ color: '#aaa' }}>
                {position?.address ?? `${decimalToDMS(position?.latitude, true)}, ${decimalToDMS(position?.longitude, false)}`}
            </Text>
        </View>
        {/* <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 4 }} onPress={() => extMapEvents.emit('recenter', position?.latitude, position?.longitude)}>
            <AntDesign name="aim" size={14} color={colors.primary} />
            <Text style={{ color: colors.primary }}>{t(`home.position.recenter`)}</Text>
        </Pressable> */}
    </View>
}