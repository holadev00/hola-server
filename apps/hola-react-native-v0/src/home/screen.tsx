import * as UserLocation from "@hola/userLocation";
import { HomeBottomSheet, HomeBottomSheetContent } from "./bottomSheet";
import { HomeScreenMap } from "./map";
import { useMobileLayout } from "@hola/navigation/hooks/useMobileLayout";
import { View } from "react-native";
import { colors, spacing } from "@hola/ui";
import { HomeBottomSheetFooterContent } from "./bottomSheet/footer/content";
import { footer } from "./bottomSheet/venue/state";

export function HomeScreen() {
	UserLocation.useUserLocation();
	const { mobile, height, width } = useMobileLayout();
	const a = (mobile && width < height) || !mobile;

	return (
		<>
			<View style={{ flex: 1, flexDirection: "row" }}>
				<HomeScreenMap />
				{!a && (
					<View
						style={{
							flex: 1,
							backgroundColor: colors.background,
							padding: spacing.lg,
                            gap: spacing.md,
                            position: "relative"
						}}
					>
						<HomeBottomSheetContent />
                        <View style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            gap: spacing.sm,
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: spacing.sm
                        }} onLayout={(e) => {
                            console.log(e.nativeEvent.layout.height);
                            footer.set(e.nativeEvent.layout.height);
                        }}>
                            <HomeBottomSheetFooterContent />
                        </View>
					</View>
				)}
			</View>
			{a && <HomeBottomSheet />}
		</>
	);
}