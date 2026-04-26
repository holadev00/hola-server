import { useSocket } from "@hola/socket";
import { colors } from "@hola/ui";
import { getTextColor } from "@hola/ui/colors";
import { observable } from "@legendapp/state";
import { useContext, useEffect } from "react";
import { View, Image, ActivityIndicator } from "react-native";
import { SocketManagerContext } from "socket-session-manager/src/client";

export const $splash = observable(true);
export const SplashScreenTimeout = 3000;

export function SplashScreen() {
	useEffect(() => {
		setTimeout(() => {
			$splash.set(false);
		}, SplashScreenTimeout);
	}, []);

	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: colors.primary,
				gap: 20,
			}}
		>
			<View
				style={{
					justifyContent: "center",
					alignItems: "center",
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.25,
					shadowRadius: 8,
					borderRadius: 35,
					overflow: "hidden",
				}}
			>
				<Image
					source={require("../../assets/hola-logo.png")}
					style={{ width: 150, height: 150 }}
				/>
			</View>
			<ActivityIndicator
				size="large"
				color={getTextColor(colors.primary)}
			/>
		</View>
	);
}