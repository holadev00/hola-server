import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { setStep$ } from "./state";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSocket } from "@hola/socket";

type Option = { option: string, active: boolean, venueId: number };
export function VenuesOptions({ venue }) {
    const socket = useSocket("/");
    const [options, setOptions] = useState<Option[]>([]);

    useEffect(() => {
        const emit = () => socket.emit('VENUES/options/get', venue, setOptions);

        emit();
        socket?.on('connect', emit);
        return () => {
            socket?.off('connect', emit);
        }
    }, [venue]);

    const icon = {
        wifi: <MaterialCommunityIcons name="wifi" size={21} color="black" />,
        parking: <MaterialCommunityIcons name="parking" size={21} color="black" />,
        food: <MaterialCommunityIcons name="hamburger" size={21} color="black" />,
        shower: <MaterialCommunityIcons name="shower" size={21} color="black" />,
        drink: <MaterialCommunityIcons name="cup" size={21} color="black" />,
        toilets: <MaterialCommunityIcons name="toilet" size={21} color="black" />,
    }

    return options?.length > 0 && <View onLayout={setStep$.bind(null, "options")}>
        <Text style={{ fontWeight: '600', fontSize: 16 }}>Options</Text>
        {options.length > 0 && <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
            {options.map(option => {
                return option?.active && <View key={option?.option} style={{}}>
                    <Text style={{ fontWeight: '600' }}>{icon[option?.option] ?? option?.option}</Text>
                </View>
            })}
        </View>}
    </View>
}