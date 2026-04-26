import { Text } from "react-native";
import typography from "../typography";

export default function Title({ children, style, ...props }: { children: any; style?: any }) {
    const titleStyle = { ...typography.title };

    return <Text style={[
        titleStyle,
        style
    ]} {...props}>
        {children}
    </Text>
}

export function Subtitle({ children, style, ...props }: { children: any; style?: any }) {
    const subtitleStyle = { ...typography.subtitle };

    return <Text style={[
        subtitleStyle,
        style
    ]} {...props}>
        {children}
    </Text>
}