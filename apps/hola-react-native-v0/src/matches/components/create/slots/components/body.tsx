import { View } from "react-native";
import { SlotSelectorItemProvider } from "../providers/SlotSelectorItemProvider";
import { useSlotSelectorItemContainer } from "../hooks/useSlotSelectorItemContainer";
import { SlotSelectorItem } from "./item";

export function SlotSelectorBody({ organizedByStart, selected, creationInput, filmedOnly, setFilmedOnly }) {
    return <View style={{ gap: 8 }}>
        {Object.entries(organizedByStart).map(([start, groups]) => {
            const { uniqueSlots, hasFilmed, isFilmedOnly } = useSlotSelectorItemContainer(groups, filmedOnly, start);

            return <SlotSelectorItemProvider
                start={start}
                uniqueSlots={uniqueSlots}
                selected={selected}
                creationInput={creationInput}
                key={start}
                hasFilmed={hasFilmed}
                isFilmedOnly={isFilmedOnly}
                setFilmedOnly={setFilmedOnly}>
                <SlotSelectorItem key={start} />
            </SlotSelectorItemProvider>;
        })}
    </View>;
}


