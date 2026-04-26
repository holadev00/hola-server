import { useContext } from "react";
import { SlotSelectorItemContext } from "../contexts/SlotSelectorItemContext";

export function useSlotSelectorItem() {
    if (!SlotSelectorItemContext) {
        throw new Error("useSlotSelectorItem must be used within a SlotSelectorItemProvider");
    }
    return useContext(SlotSelectorItemContext);
}
