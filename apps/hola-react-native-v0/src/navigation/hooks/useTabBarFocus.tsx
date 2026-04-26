import { getActiveRouteName } from "../functions/getActiveRouteName";

export function useTabBarFocus(navigation, route) {
    const routeName = getActiveRouteName(navigation.getState());
    let isFocused;
    isFocused = routeName?.startsWith(route.name);
    if (route.name === "CustomerMatches") isFocused = routeName?.startsWith("CustomerMatch");
    return isFocused;
}
