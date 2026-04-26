import { View } from "react-native";
import { useSlotSelectorItem } from "../../hooks/useSlotSelectorItem";
import { SlotSelectorItemSlot } from "./slot";


export function SlotSelectorItemSlots() {
    const { uniqueSlots } = useSlotSelectorItem();

    const style = { flexDirection: "row", flex: 1, gap: 8, justifyContent: "flex-start", alignItems: "center" };

    return <View style={style}>
        {uniqueSlots.sort((a, b) => a.slot - b.slot).map(slot => <SlotSelectorItemSlot key={slot.slot} slot={slot} />)}
    </View>;
}
