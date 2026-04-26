import { registerRootComponent } from 'expo';
import { HolaProvider } from '@hola/react-provider';
import "./global.css"
import App from './App';
import "@expo/metro-runtime";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(() => {
    return <HolaProvider>
        <App />
    </HolaProvider>;
});
