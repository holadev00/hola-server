import { View } from "react-native";
import { SlotSelectorItemFilmedSwitch } from "./filmedSwitch";
import { SlotSelectorItemSlots } from "./slots";
import { SlotSelectorItemTime } from "./time";

export function SlotSelectorItem({  }) {
    const style = {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    }

    return <View style={style}>
        <SlotSelectorItemTime />
        <SlotSelectorItemSlots />
        {/* <SlotSelectorItemFilmedSwitch /> */}
    </View>;
}
