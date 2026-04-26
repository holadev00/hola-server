
export function useSlotSelectorItemContainer(groups: unknown, filmedOnly: {}, start: string) {
    const hasFilmed = groups.filmed.length > 0;
    const isFilmedOnly = filmedOnly?.[start] && hasFilmed;

    const slotsSource = isFilmedOnly
        ? groups.filmed
        : [...groups.filmed, ...groups.notFilmed];

    const uniqueSlots = Object.values(
        slotsSource.reduce((acc, item) => {
            if (!acc[item.slot]) {
                acc[item.slot] = item;
            }
            return acc;
        }, {})
    );

    return { uniqueSlots, hasFilmed, isFilmedOnly };
}
