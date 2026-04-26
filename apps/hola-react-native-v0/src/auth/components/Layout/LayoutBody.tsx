import { ScrollView } from "react-native";


export function LayoutBody({ children }: { children: React.ReactNode; }) {
    return (
        <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            {children}
        </ScrollView>
    );
}
