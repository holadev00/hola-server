import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../styles";
import type { LayoutProps } from "./LayoutProps";
import { LayoutFooter } from "./LayoutFooter";
import { LayoutBody } from "./LayoutBody";
import { LayoutHeader } from "./LayoutHeader";

export function Layout({
    title,
    children,
    primaryAction,
    secondaryAction,
    header = true
}: LayoutProps) {
    return (
        <SafeAreaView style={styles.screenContainer}>
            {header && <LayoutHeader title={title} />}
            <LayoutBody>{children}</LayoutBody>
            <LayoutFooter
                primaryAction={primaryAction}
                secondaryAction={secondaryAction}
            />
        </SafeAreaView>
    );
}



