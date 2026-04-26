import moment from "moment";
import { Text } from "react-native";
import { useSlotSelectorItem } from "../../hooks/useSlotSelectorItem";


export function SlotSelectorItemTime() {
    const { start } = useSlotSelectorItem();

    return <Text style={{ width: 60 }}>
        {moment().startOf("day").add(start, "minutes").format("HH:mm")}
    </Text>;
}
