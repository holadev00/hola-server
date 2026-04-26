import { useAuth } from '@hola/react-provider';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { createExpoAuthProviders } from '@chadt.ana/expo/auth';

export const { useExpoGoogleAuth } = createExpoAuthProviders({
    scheme: "test-app",
    clientIds: {
        google: {
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        }
    }
});
export default function App() {
    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-xl font-bold text-blue-500">
                Welcome to Nativewind!
            </Text>

            {/* <View style={styles.container}>
                <AuthScreen />
                <Text>Open up App.tsx to start working on your app!</Text>
                <StatusBar style="auto" />
            </View> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

/* function AuthScreen() {
    const { loading, isLoggedIn, socialSignIn, signOut } = useAuth();
    const { button: GoogleAuthButton } = useExpoGoogleAuth(socialSignIn);

    console.log(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

    return loading ?
        <ActivityIndicator size="large" color="#0000ff" /> :
        !isLoggedIn ?
            <Pressable {...GoogleAuthButton} >
                <Text>Sign in with Google</Text>
            </Pressable> :
            <Button title="logout" onPress={signOut} />
} */