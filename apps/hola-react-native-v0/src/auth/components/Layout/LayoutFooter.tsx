import { View } from "react-native";
import { ActionButton } from "../ActionButton";
import type { LayoutActionProps } from "./LayoutActionProps";
import { colors } from "@hola/ui";

export function LayoutFooter({
    primaryAction, secondaryAction,
}: {
    primaryAction?: LayoutActionProps;
    secondaryAction?: LayoutActionProps;
}) {
    return (
        <View
            style={{
                padding: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 8,
            }}
        >
            {secondaryAction && (
                <ActionButton
                    title={secondaryAction.label}
                    color={secondaryAction.color ?? colors.secondary}
                    style={{ flex: 1 }}
                    onPress={secondaryAction.onPress}
                    {...secondaryAction} />
            )}
            {primaryAction && (
                <ActionButton
                    title={primaryAction.label}
                    color={primaryAction.color ?? colors.primary}
                    style={{ flex: 1 }}
                    onPress={primaryAction.onPress}
                    {...primaryAction} />
            )}
        </View>
    );
}
