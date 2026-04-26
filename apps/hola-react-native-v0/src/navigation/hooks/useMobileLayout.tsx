import { useState, useEffect } from "react";
import { useWindowDimensions } from "react-native";

export function useMobileLayout() {
    const { width, height } = useWindowDimensions();
    const [mobile, setMobile] = useState(true);

    useEffect(() => {
        const ratio = width / height;

        const isPortraitMobile = ratio < 0.8;
        const isSmallScreen = width < 768 || height < 600;

        setMobile(isPortraitMobile || isSmallScreen);
    }, [width, height]);

    return { mobile, width, height };
}
