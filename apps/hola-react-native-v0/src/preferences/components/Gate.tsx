import { View } from 'react-native';
import { bindSocketSync, useSocket } from '@hola/socket';
import { Computed, useObservable } from '@legendapp/state/react';
import { useEffect } from 'react';
import { spacing } from '@hola/ui';
import { language$, Selector as LangSelector } from '@hola/lang';

export function Gate() {
    const initialized = useObservable(false);
    const socket = useSocket("/");

    const fetchedPreferences = useObservable(null);

    useEffect(() => {
        function setPreferences(data) {
            language$.set(data?.language);
            fetchedPreferences.set(data);
            initialized.set(true);
        }

        bindSocketSync(socket, {
            emit: "PREFERENCES/get",
            listen: "PREFERENCES/update",
            payload: setPreferences,
            onMessage: setPreferences,
        });
    }, []);

    function Fullscreen({ children }) {
        return <View style={
            {
                flex: 1,
                backgroundColor: "#fff",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
                padding: spacing.lg,
            }
        }>
            {children}
        </View>;
    }

    return (
        <Computed>
            {() => {
                if (!initialized.get()) {
                    return <></>;
                }

                if (!fetchedPreferences?.get()?.language) {
                    return <Fullscreen>
                        <LangSelector />
                    </Fullscreen>;
                }
            }
            }
        </Computed>
    )
}