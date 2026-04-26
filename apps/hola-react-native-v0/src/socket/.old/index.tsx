import { createContext, useContext, useState, useEffect } from 'react';
import { Manager } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const url = (window.location.hostname === "localhost" ? "http://localhost" : process.env.EXPO_PUBLIC_API_URL) || 'http://localhost';
export const SocketManagerContext = createContext<Manager | null>(null);

export function useSocketManager() {
    const context = useContext(SocketManagerContext);
    if (!context) {
        throw new Error("useSocketManager must be used within a SocketManagerProvider");
    }
    return context;
}

export function SocketManagerProvider({ children }: { children: React.ReactNode; }) {
    const [manager, setManager] = useState<Manager | null>(null);
    useEffect(() => {
        visitorToken().then(async (token) => {
            const newSocket = new Manager(`${url}`, {
                transports: ['websocket'],
                withCredentials: true,
                secure: true,
                upgrade: true,
                rejectUnauthorized: false,
                forceBase64: true,
                closeOnBeforeunload: true,
                query: {
                    visitorToken: token
                }
            });

            newSocket.on('error', (err) => console.log(err.message, err.name));

            setManager(newSocket);
        });

        return () => {
            if (manager) manager?._close();
        };
    }, []);

    return manager &&(
        <>
            <SocketManagerContext.Provider value={manager}>
                {children}
            </SocketManagerContext.Provider>
        </>
    );
}

const visitorToken = async function () {
    const cache = await AsyncStorage.getItem("visitorToken");
    if (cache) return cache;

    const res = await fetch(`${url}/initiate-visitor`);
    if (res.ok) {
        const data = await res.json();
        const token = data.token;
        await AsyncStorage.setItem("visitorToken", token);
        return token;
    }
};
