export function getActiveRouteName(navigationState) {
    if (!navigationState) return null;
    const route = navigationState.routes[navigationState.index];
    if (route.routes) return getActiveRouteName(route);
    return route.name ?? route.routeName;
}
