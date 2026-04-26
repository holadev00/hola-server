import { Switch } from "react-native";
import { useSlotSelectorItem } from "../../hooks/useSlotSelectorItem";


export function SlotSelectorItemFilmedSwitch() {
    const { start, hasFilmed, isFilmedOnly, setFilmedOnly } = useSlotSelectorItem();

    return hasFilmed && (
        <Switch
            value={isFilmedOnly}
            onValueChange={(value) => setFilmedOnly(prev => ({
                ...prev,
                [start]: value
            }))} />
    );
}
