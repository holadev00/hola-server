import * as VenuesMarkers from '@hola/home/map/VenuesMarkers';
import { lazy, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { VenueCourts } from "./courts";
import { VenueImages } from "./images";
import { VenuesOptions } from "./options";
import { HomeBottomSheetHeader } from "../header";
import { VenueSchedule } from "./schedule";
import { footer, snapToImages, snapToHeader } from "./state";

export function HomeBottomSheetVenue({ venue }) {
    useEffect(() => {
        footer.set(true);
        snapToImages.fire();

        return () => {
            footer.set(false);
            snapToHeader.fire();
        };
    }, [venue?.id]);

    return <View style={{ flex: 1, gap: 16 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <HomeBottomSheetHeader
                title={venue?.name}
                position={venue} />
            <VenuesMarkers.FavoriteButton id={VenuesMarkers.selected.get()?.id} />
        </View>
        <ScrollView style={{}} contentContainerStyle={{ gap: 16, paddingBottom: footer.get() ? 67 : undefined }}>
            <VenueImages venue={venue.id} />
            <VenueSchedule venue={venue.id} />
            <VenueCourts venue={venue.id} />
            <VenuesOptions venue={venue.id} />
        </ScrollView>
    </View>
}