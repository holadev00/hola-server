import { mergeIntoObservable, observable } from "@legendapp/state";

export const $auth = observable({
    initialized: false,
    isLoggedIn: false,
    isManager: false
});

export const handleAuthState = (res) => {
    mergeIntoObservable($auth, {
        ...res,
        initialized: true
    });
};

