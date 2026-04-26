import { observable } from "@legendapp/state";

export const currentDay = observable(0);
export let bottomHeight = observable(0);
export const loading = observable(true);
export const hotToast = observable(null);