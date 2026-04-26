import { Computed } from "@legendapp/state/react";
import { use, useState } from "react";
import { View } from "react-native";
import { SlotSelectorBody } from "./body";
import { useSlotSelector } from "../hooks/useSlotSelector";
import { SlotSelectorHeader } from "./header";

export function SlotSelector({ availabilities, daysFromNow, creationInput }) {
    const [filmedOnly, setFilmedOnly] = useState({});

    return <Computed>
        {() => {
            const { organizedByStart, selected } = useSlotSelector(creationInput, availabilities, daysFromNow);

            if (!organizedByStart) {
                return null;
            }

            return (
                <View style={{ gap: 8, paddingHorizontal: 12 }}>
                    <SlotSelectorHeader />
                    <SlotSelectorBody
                        organizedByStart={organizedByStart}
                        selected={selected}
                        creationInput={creationInput}
                        filmedOnly={filmedOnly}
                        setFilmedOnly={setFilmedOnly} />
                </View>
            );
        }}
    </Computed>;
}

