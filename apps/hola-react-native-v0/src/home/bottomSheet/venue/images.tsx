import { observable } from "@legendapp/state";
import { Computed } from "@legendapp/state/react";
import { useState, useEffect } from "react";
import { View, Image } from "react-native";
import { setStep$, steps$ } from "./state";
import { useSocket } from "@hola/socket";

type Image = { id: number, url: string };
const images = observable<Image[]>([]);
export function VenueImages({ venue }) {
    const socket = useSocket("/");
    const [expand, setExpand] = useState(true);
    const [width, setWidth] = useState(0);
    const [y, setY] = useState(0);

    useEffect(() => {
        const emit = () => socket.emit('VENUES/images/get', venue, images.set);

        emit();
        socket?.on('connect', emit);
        return () => {
            socket?.off('connect', emit);
        }
    }, [venue]);

    return <Computed>
        {() => (images.get() && images.get().length > 0) && <View style={{ gap: 8 }} onLayout={setStep$.bind(null, "images")}>
            {images.get().length > 0 && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, height: expand ? "auto" : 100, overflow: "hidden", marginRight: -4 }} onLayout={e => {
                setWidth(e.nativeEvent.layout.width);
            }}>
                {images.get().map((image, i) => {
                    return <Image key={image?.id} source={{ uri: image?.url }} style={{ width: (width / 3) - 4, aspectRatio: 1, backgroundColor: "#ccc" }} onLayout={(e) => {
                        if (i > 0) return;
                        if (steps$?.["images-dim"].get()) return;
                        steps$?.["images-dim"].set(y + e.nativeEvent.layout.width)
                    }} />
                })}
            </View>}
        </View>}
    </Computed>
}