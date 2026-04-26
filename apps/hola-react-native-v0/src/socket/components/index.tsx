import { Manager } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import { Platform } from 'react-native';
import { SplashScreen } from '@hola/navigation/SplashScreen';

export const url = Platform.select({
    default: (
        process.env.NODE_ENV === "development"
            ? (
                window?.location?.hostname === "localhost"
                    ? "http://localhost"
                    : process.env.EXPO_PUBLIC_API_URL
            )
            : undefined
    ),
})
export function SocketProvider({ children }) {
    const [connected, setConnected] = useState(false);
    const managerRef = useRef<Manager | null>(null);

    useEffect(() => {
        const visitorToken = async function () {
            const cache = await AsyncStorage.getItem("visitorToken");
            if (cache) return cache;

            const res = await fetch(`${url ?? ""}/initiate-visitor`);
            try {
                if (res.ok) {
                    const data = await res.json();
                    const token = data.token;
                    await AsyncStorage.setItem("visitorToken", token);
                    return token;
                }
            } catch (error) {
                console.error(error);
            }
        };

        (async () => {
            const token = await visitorToken();

            managerRef.current = new Manager(url, {
                transports: ["websocket"],
                withCredentials: true,
                secure: url ? new URL(url).protocol === "https:" : false,
                query: { visitorToken: token },
                reconnection: true,
                reconnectionDelay: 5000,
            });

            managerRef?.current.on("open", () => {
                setConnected(true);
            });
        })();

        return () => {
            managerRef.current?.disconnect();
            managerRef.current = null;
        };
    }, []);

    return (
        connected ? <SocketContext.Provider value={managerRef}>
            {children}
        </SocketContext.Provider> :
            <SplashScreen />
    );
}