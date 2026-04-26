import { useSocket } from '@hola/socket';
import { useObservable } from '@legendapp/state/react';
import { EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export function HolaStripeProvider({ children, currency, amount, quantity = 1, venue, onComplete = () => { } }) {
    const socket = useSocket("/");
    const [loading, setLoading] = useState(true);
    const [seshId, setSeshId] = useState(null);
    const _seshId = useObservable(null);

    const stripePromise = useMemo(() => {
        const pKey = async () => await socket.emitWithAck(`STRIPE/pbsh`);
        return pKey()
            .then(loadStripe);
    }, []);

    const fetchClientSecret = useCallback(() => {
        if (!currency || !amount || !quantity || !venue) return;

        setLoading(true);
        const checkoutSession = async () => await socket.emitWithAck(`STRIPE/cs`, { venue, currency, amount, quantity });

        return checkoutSession()
            .then((data) => {
                console.log(data);
                setLoading(false);
                if (!data.checkoutSessionId) return;
                _seshId.set(data.checkoutSessionId);
                setSeshId(data.checkoutSessionId);
                return data
            })
            .then((data) => data.checkoutSessionClientSecret);
    }, [currency, amount, quantity, venue]);

    return (
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{
            fetchClientSecret,
            onComplete: () => {
                onComplete(_seshId.get());
            }
        }}>
            {loading ?
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator />
                </View> :
                children}
        </EmbeddedCheckoutProvider>
    );
}