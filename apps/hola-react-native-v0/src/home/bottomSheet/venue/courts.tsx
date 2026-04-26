import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { setStep$ } from "./state";
import { useSocket } from "@hola/socket";
import { useTranslation } from "react-i18next";

type Court = { name: string, sport: string, indoor: boolean, filmed: boolean, id: number, venueId: number };
export function VenueCourts({ venue }) {
    const socket = useSocket("/");
    const [courts, setCourts] = useState<Court[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        const emit = () => socket.emit('VENUES/courts/get', venue, setCourts);

        emit();
        socket?.on('connect', emit);
        return () => {
            socket?.off('connect', emit);
        }
    }, [venue]);

    const sports = [...new Set(courts.map(item => item.sport))];

    return courts?.length > 0 && <View onLayout={setStep$.bind(null, "courts")}>
        <Text style={{ fontWeight: '600', fontSize: 16 }}>{t(`venue.courts`)}</Text>
        {sports.map(sport => {
            const icon = {
                football: <MaterialCommunityIcons name="soccer" size={18} color="black" />,
                tennis: <MaterialCommunityIcons name="tennis-ball" size={18} color="black" />,
            }

            const courts_ = courts.filter(c => c.sport === sport);

            const indoor = courts_.filter(c => c.indoor);
            const outdoor = courts_.filter(c => !c.indoor);
            const filmed = courts_.filter(c => c.filmed);

            const parts: string[] = [];

            if (indoor.length > 0) {
                parts.push(
                    `${indoor.length} terrain${indoor.length > 1 ? 's' : ''} indoor`
                );
            }

            if (outdoor.length > 0) {
                parts.push(
                    `${outdoor.length} terrain${outdoor.length > 1 ? 's' : ''} outdoor`
                );
            }

            if (filmed.length > 0) {
                parts.push(
                    `dont ${filmed.length} filmé${filmed.length > 1 ? 's' : ''}`
                );
            }

            return (
                <View key={sport} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}>
                    <Text style={{ fontWeight: '600' }}>{icon[sport]}</Text>
                    <Text>{parts.join(', ')}</Text>
                </View>
            );
        })}
    </View>
}