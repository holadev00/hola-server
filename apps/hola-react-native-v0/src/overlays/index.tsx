import colors from "@hola/ui/colors";
import { observable, observe } from "@legendapp/state";
import { Computed } from "@legendapp/state/react";
import { View, ActivityIndicator, Text } from "react-native";
import invert from "invert-color";
import spacing from "@hola/ui/spacing";

export const appLoading = observable(false);
export function Loading() {
    return <Computed>
        {() => {
            return appLoading.get() && <View style={{ flex: 1, backgroundColor: `${invert(colors.background)}dd`, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        }}
    </Computed>
}

export const appHotToast = observable<{ date: number, title: string, message: string, type: "success" | "error", duration?: number }[]>([]);

observe(appHotToast, ({ value }) => {
    value.forEach(({ date, title, message, type, duration }) => {
        setTimeout(() => {
            appHotToast.set(appHotToast.get().filter(item => item.date !== date));
        }, duration || 3000);
    })
})

export function HotToast() {
    return <Computed>
        {() => {
            return <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, justifyContent: 'center', alignItems: 'stretch', flexDirection: 'column', gap: spacing.md, padding: spacing.lg }}>
                {appHotToast.get().map(({ date, title, message, type }) => (
                    <View key={date} style={{
                        padding: 10,
                        borderRadius: 5,
                        backgroundColor: type === "success" ? colors.success : colors.error
                    }}>
                        <Text style={{ color: "white", fontWeight: "bold" }}>{title}</Text>
                        <Text style={{ color: "white" }}>{message}</Text>
                    </View>
                ))}
            </View>
        }}
    </Computed>
}