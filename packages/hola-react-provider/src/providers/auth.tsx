import { Computed, useObservable } from "@legendapp/state/react";
import { createContext, useContext, useEffect } from "react";
import { manager } from "../socket";

const socket = manager.socket("/auth");

export const authContext = createContext({
    loading: true,
    isLoggedIn: false,
    signUp: () => { },
    signIn: () => { },
    socialSignIn: ({ username, email, provider, providerId, avatar }: { username: string; email: string; provider: string; providerId: string; avatar: string }) => { },
    signOut: () => { }
})

export const useAuth = () => {
    return useContext(authContext);
}

export const AuthProvider = function ({ children }: { children: React.ReactNode }) {
    const store = useObservable({
        initialized: false,
        isLoggedIn: false,
    });

    function processAvatar({ url, blob }: any) {
        if (url) return url;
        if (blob) return blob;
        return null;
    }

    function socialSignIn({ username, email, provider, providerId, avatarUrl }: any) {
        const avatar = processAvatar({ url: avatarUrl });
        if (socket) socket.emit("socialSignIn", { username, email, provider, providerId, avatar });
    }

    function signOut() {
        if (socket) socket.emit("signOut");
    }

    useEffect(() => {
        socket.on('auth:isLoggedIn', (data) => {
            store.isLoggedIn.set(data);
            store.initialized.set(true);
        });
    }, [])

    return (
        <Computed>
            {() => store.initialized.get() && <authContext.Provider value={{
                loading: !store.initialized.get(),
                isLoggedIn: store.isLoggedIn.get(),
                socialSignIn,
                signUp: () => { },
                signIn: () => { },
                signOut
            }}>
                {children}
            </authContext.Provider>}
        </Computed>
    )
}