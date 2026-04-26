import { Platform, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from '@hola/navigation';
import { SocketProvider } from '@hola/socket';
import * as UserLocation from '@hola/userLocation';
import * as Overlays from '@hola/overlays';
import * as Preferences from '@hola/preferences';

export default function App() {
    return (
        <>
            <SocketProvider>
                <SafeAreaProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                        <Overlays.Loading />
                        <Overlays.HotToast />
                        <UserLocation.InputModal />
                        <Preferences.Gate />
                        <View style={{ flex: 1, backgroundColor: "#fff" }}>
                            <Navigation />
                        </View>
                        <StatusBar style="auto" />
                    </GestureHandlerRootView>
                </SafeAreaProvider>
            </SocketProvider>

            {Platform.OS === 'web' && <>
                <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
                <script noModule src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js"></script>
            </>}
        </>
    );
}

