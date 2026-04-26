import { Text, View, Pressable } from "react-native";
import { $TextInput } from "@legendapp/state/react-native";
import { Computed, useObserveEffect } from "@legendapp/state/react";
import { FlatList } from "react-native";
import { KeyboardAvoidingView } from "react-native";

import { useSocket } from "@hola/socket";
import userLocation from "../state/userLocation";
import userInputStore from "../state/userInputStore";
import { RequestLocationPermission } from "../components/RequestLocationPermission";


export function InputModal() {
    const socket = useSocket("/");

    useObserveEffect(userLocation, ({ value }) => {
        if (value?.latitude && value?.longitude) {
            socket.emit('USER/location/set', value);
        }
    });

    const btnStyle = { flex: 1, padding: 6, borderRadius: 5, justifyContent: "center", alignItems: "center" };

    return <Computed>{() => {
        const submit = () => {
            const userInput = userInputStore.search.address.get();
            if (!userInput) return;
            socket.emit('geocode', userInput, userInputStore.search.result.set);
            userInputStore.submit.fire();
        };
        const dismiss = () => {
            userInputStore.dismiss.fire();
        };

        const selectSearchResult = (latitude: number, longitude: number, address: string) => {
            userInputStore.search.result.set([]);
            userInputStore.open.set(false);
            userLocation.set({ latitude, longitude, address });
        }

        if (userInputStore.open.get()) {
            return <View style={{ flex: 1, position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, backgroundColor: "#000d" }}>
                <KeyboardAvoidingView style={{ flex: 1, justifyContent: "center", alignItems: "center" }} behavior="padding">
                    <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%", gap: 10 }}>
                        <View>
                            <Text style={{
                                fontSize: 20,
                                fontWeight: "bold",
                            }}>Trouvons les fives près de vous</Text>
                            <RequestLocationPermission />
                        </View>
                        <$TextInput
                            $value={userInputStore.search.address}
                            onSubmitEditing={submit}
                            onEndEditing={submit}
                            placeholder="Recherchez une adresse autour de vous"
                            placeholderTextColor={"gray"}
                            style={{
                                backgroundColor: "#f5f5f5",
                                padding: 10,
                                borderRadius: 5,
                                outlineWidth: 0
                            }} />
                        {/*<Pressable style={{ flexDirection: "row", alignItems: "center", gap: 10 }} onPress={async () => {
                            console.log(granted, canAskAgain);
                        }}>
                            <Feather name="crosshair" size={20} color="dodgerblue" />
                            <Text style={{ color: "dodgerblue" }}>Utiliser ma position actuelle</Text>
                        </Pressable>*/}
                        {userInputStore.search.result.get().length > 0 ? <FlatList
                            data={userInputStore.search.result.get()}
                            keyExtractor={(item, index) => index.toString()}
                            style={{
                                maxHeight: 200,
                                backgroundColor: "#eee",
                                borderRadius: 10,
                            }}
                            contentContainerStyle={{ overflow: "hidden" }}
                            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#ddd" }} />}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => selectSearchResult(item.latitude, item.longitude, item?.formatted_address)}
                                    style={{ padding: 10 }}
                                >
                                    <Text style={{}}>{item.formatted_address.split(", ")[0]}</Text>
                                    {item.formatted_address.split(", ").slice(1).map((item) => <Text key={item} style={{ fontSize: 12, color: "#aaa" }}>{item}</Text>)}
                                </Pressable>
                            )}
                            showsVerticalScrollIndicator={false}
                        /> :
                            <View style={{ flexDirection: "row", gap: 10 }}>
                                <Pressable style={[{ backgroundColor: "#eee" }, btnStyle]} onPress={dismiss}>
                                    <Text>Plus tard</Text>
                                </Pressable>
                                {userInputStore.search.address.get()?.length > 0 && <Pressable style={[{ backgroundColor: "dodgerblue" }, btnStyle]} onPress={submit}>
                                    <Text style={{ color: "#fff" }}>Recherchez</Text>
                                </Pressable>}
                            </View>}
                    </View>
                </KeyboardAvoidingView>
            </View>
        }

        return <></>
    }}</Computed>
}