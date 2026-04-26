import { SlotSelectorItemContext } from "../contexts/SlotSelectorItemContext";


export function SlotSelectorItemProvider({ start, uniqueSlots, selected, creationInput, hasFilmed, isFilmedOnly, setFilmedOnly, children }) {
    return <SlotSelectorItemContext.Provider value={{ start, uniqueSlots, selected, creationInput, hasFilmed, isFilmedOnly, setFilmedOnly }}>
        {children}
    </SlotSelectorItemContext.Provider>;
}
