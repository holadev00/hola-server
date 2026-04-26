import { useSocket } from '@hola/socket';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

export function HolaStripeProvider({ children }) {
    const [publishableKey, setPublishableKey] = useState('');
    const socket = useSocket("/");

    const fetchPublishableKey = async () => {
        const key = await socket.emitWithAck(`STRIPE/pbsh`);
        setPublishableKey(key);
    };

    useEffect(() => {
        fetchPublishableKey();
    }, []);

    return (
        <StripeProvider
            publishableKey={publishableKey}
            merchantIdentifier="merchant.identifier" // required for Apple Pay
            urlScheme={
                Constants.executionEnvironment === 'expo'
                    ? Linking.createURL('/--/')
                    : Linking.createURL('')
            } // required for 3D Secure and bank redirects
        >
            {children}
        </StripeProvider>
    );
}