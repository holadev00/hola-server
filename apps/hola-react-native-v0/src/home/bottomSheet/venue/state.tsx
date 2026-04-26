import { observable, event } from "@legendapp/state";

export const steps$ = observable<{ [key: string]: any }>({});
export const setStep$ = (key, e) => steps$?.[key]?.set(e.nativeEvent.layout.y + e.nativeEvent.layout.height);
export const bottomSheetPosition = observable(0);
export const snapPoints = observable({
    header: 134,
    fullscreen: "100%"
});

snapPoints.onChange(({ value }) => console.log("snapPoints", value));

export const footer = observable(false);
export const steps = observable([]);

export const snapToHeader = event();
export const snapToImages = event();