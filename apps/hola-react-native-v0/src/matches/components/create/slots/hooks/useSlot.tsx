import colors from "@hola/ui/colors";
import moment from "moment";
import Color from "colorjs.io";
import invert from "invert-color";

export function useSlot(selected: any, start: any, slot: any, creationInput: any, daysFromNow: any) {
    const isSelected = selected &&
        selected.start === Number(start) &&
        selected.slot === slot.slot &&
        selected.court.id === slot.court.id
        && selected.daysFromNow === daysFromNow;

    const slotDisplay = moment().startOf("day").add(slot.slot * 60, "minutes");
    let slotDisplayMinutes = Number(slotDisplay.format("mm"));

    if (slotDisplayMinutes === 0) {
        slotDisplayMinutes = "";
    }

    const color = isSelected ? colors.primary : Color.mix(
        colors.primary,
        colors.background,
        0.85,
        { space: "lch", outputSpace: "srgb" }
    ).toString({ format: "hex" });

    const slotStyle = {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 4,
        backgroundColor: color,
        color: invert(color, { black: "#000", white: "#FFF", threshold: 0.5 })
    };

    const onSlotPress = () => {
        if (isSelected) {
            return creationInput.selectedAvailability.set(null);
        }
        
        creationInput.selectedAvailability.set({
            court: slot.court,
            start: Number(start),
            end: slot.end,
            slot: slot.slot,
            daysFromNow,
            pricePerPlayerPerHour: slot.pricePerPlayerPerHour,
            priceTotal: slot.priceTotal,
            currency: slot.currency
        });
    };
    
    return { onSlotPress, slotStyle, isSelected, slotDisplay, slotDisplayMinutes };
}
