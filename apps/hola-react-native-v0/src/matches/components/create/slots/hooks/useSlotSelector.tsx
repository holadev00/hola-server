export function useSlotSelector(creationInput: any, availabilities: any, daysFromNow: any) {
    const selected = creationInput.selectedAvailability.get();

    const organizedByStart = availabilities?.[daysFromNow]
        ?.sort((a, b) => a.start - b.start)
        ?.reduce((acc, item) => {
            const start = item.start;

            if (!acc[start]) {
                acc[start] = {
                    filmed: [],
                    notFilmed: []
                };
            }

            if (item.court.filmed) {
                acc[start].filmed.push(item);
            } else {
                acc[start].notFilmed.push(item);
            }

            return acc;
        }, {});
    return { organizedByStart, selected };
}
