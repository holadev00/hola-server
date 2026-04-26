import { HomeScreen } from "@hola/home/screen";
import * as ui from "@hola/ui";
import { View } from "react-native";
import { useMobileLayout } from "../hooks/useMobileLayout";
import { Computed } from "@legendapp/state/react";
import { $splash } from "../SplashScreen";

export function AppLayout({ children }) {
    const { mobile, height } = useMobileLayout();
    const shadow = {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    };

    return <Computed>
        {() => {
            return <View style={{
                flex: 1,
                flexDirection: "row",
                //padding: mobile ? 0 : ui.spacing.xl,
                //gap: mobile ? 0 : ui.spacing.xl
            }}>
                {(!mobile && !$splash.get()) && <View style={[{
                    width: "50%",
                    maxWidth: height / 2,
                    backgroundColor: ui.colors.primary,
                    //borderRadius: ui.radius.lg,
                    overflow: "hidden",
                }, shadow]}>
                    <HomeScreen />
                </View>}
                <View style={[{
                    flex: 1,
                    //borderRadius: ui.radius.lg,
                    overflow: "hidden"
                }, shadow]}>
                    {children}
                </View>
            </View>
        }}
    </Computed>;
}
