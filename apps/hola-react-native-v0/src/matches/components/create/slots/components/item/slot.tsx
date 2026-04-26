import { Pressable, Text, View } from "react-native";
import { useSlotSelectorItem } from "../../hooks/useSlotSelectorItem";
import { useSlot } from "../../hooks/useSlot";
import { useVenue } from "@hola/matches/contexts/venuesScreen";
import Feather from '@expo/vector-icons/Feather';
import { typography } from "@hola/ui";
import { useTranslation } from "hola-lang";
import { sportIcon } from "@hola/matches/components/sportIcon";

export function SlotSelectorItemSlot({ slot }) {
    const { t } = useTranslation();
    const { daysFromNow } = useVenue();
    const { selected, creationInput, start } = useSlotSelectorItem();
    var { onSlotPress, slotStyle, isSelected, slotDisplay, slotDisplayMinutes } = useSlot(selected, start, slot, creationInput, daysFromNow);

    return (
        <Pressable
            key={`${slot.slot}`}
            onPress={onSlotPress}
            style={[slotStyle, { flexDirection: "row", alignItems: "center", gap: 16 }]}
        >
            { sportIcon(24, slotStyle.color, slot.court.sport) }
            <View style={{ gap: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ color: slotStyle.color, fontWeight: "bold" }}>
                        {slotDisplay.format("H")}h{slotDisplayMinutes}
                    </Text>
                    {isSelected && <Feather name="check-circle" size={16} color={slotStyle.color} />}
                </View>

                {/* <Text style={{ color: slotStyle.color, fontSize: typography.helper.fontSize }}>{t(`slot.pricePerPlayerPerHour`, { price: slot.pricePerPlayerPerHour, currency: slot.currency })}</Text> */}
                <Text style={{ color: slotStyle.color, fontSize: typography.helper.fontSize }}>{t(`slot.pricePerPlayer`, { price: slot.priceTotal, currency: t(`currency.${slot.currency}`) })}</Text>
            </View>
        </Pressable>
    );
}
