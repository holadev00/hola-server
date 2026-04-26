import BottomSheet, {
    BottomSheetView,
    BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { lazy, useCallback, useEffect, useRef } from "react";
import { Computed } from "@legendapp/state/react";
import * as UserLocation from "@hola/userLocation";
import * as VenuesMarkers from '@hola/home/map/VenuesMarkers';
import { useTranslation } from "react-i18next";
import {
    bottomSheetPosition,
    footer,
    snapToHeader,
    snapToImages,
    steps$,
} from "./venue/state";
import { HomeBottomSheetHeader } from "./header";
import { HomeBottomSheetFooter } from "./footer";
import { HomeBottomSheetVenue } from "./venue";

export function HomeBottomSheet() {
    const { t } = useTranslation();
    const ref = useRef(null);
    const insets = useSafeAreaInsets();
    const handleSheetChange = useCallback((...args) => {
        //console.log("handleSheetChange", args[2]);
        bottomSheetPosition.set(args[2]);
    }, []);

    const renderFooter = useCallback(HomeBottomSheetFooter, []);

    useEffect(() => {
        snapToImages.on(() => {
            setTimeout(() => ref.current?.snapToIndex(1), 500);
        });

        snapToHeader.on(() => {
            ref.current?.snapToIndex(0);
        });
    }, []);

    return (
        <Computed>
            {function () {
                const style = {
                    flex: 1,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    paddingBottom: footer.get() ? 67 : undefined,
                };

                return (
                    <BottomSheet
                        index={0}
                        ref={ref}
                        snapPoints={[
                            ...(footer.get()
                                ? Object.entries(steps$.get()).map(
                                    ([key, step]) => {
                                        if (key === "header")
                                            return step + 100;
                                        return (
                                            step +
                                            steps$.get()["header"] +
                                            100 +
                                            16
                                        );
                                    },
                                )
                                : []),
                            "100%",
                        ]}
                        enableDynamicSizing={true}
                        topInset={insets.top}
                        bottomInset={0}
                        onAnimate={handleSheetChange}
                        footerComponent={renderFooter}
                        backgroundStyle={{
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 4,
                            },
                            shadowOpacity: 1,
                            shadowRadius: 8,
                        }}
                    >
                        {VenuesMarkers?.selected?.get() ? (
                            <>
                                <BottomSheetScrollView style={style}>
                                    <HomeBottomSheetContent />
                                </BottomSheetScrollView>
                            </>
                        ) : (
                            <BottomSheetView style={style}>
                                <HomeBottomSheetContent />
                            </BottomSheetView>
                        )}
                    </BottomSheet>
                );
            }}
        </Computed>
    );
}


export function HomeBottomSheetContent() {
    const { t } = useTranslation();

    return <Computed>
        {() => {
            return VenuesMarkers?.selected?.get() ? (
                <HomeBottomSheetVenue
                    venue={VenuesMarkers?.selected?.get()}
                />
            ) : (
                <HomeBottomSheetHeader
                    title={t(`home.position.your`)}
                    changeButton={
                        <UserLocation.ChangeLocationButton />
                    }
                    position={UserLocation.userLocation.get()}
                />
            )
        }}
    </Computed>;
}
