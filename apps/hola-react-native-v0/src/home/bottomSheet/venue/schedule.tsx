import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import moment from 'moment';
import colors from '@hola/ui/colors';
import { setStep$ } from './state';
import { useSocket } from '@hola/socket';
import { useTranslation } from 'react-i18next';

type Schedule = { venueId: number, weekDay: number, start: string, end: string, active: boolean, closed: boolean, date: string };
export function VenueSchedule({ venue }) {
    const socket = useSocket("/");
    const [schedule, setSchedule] = useState<Schedule[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        const emit = () => socket?.emit('VENUES/schedule/get', venue, setSchedule);

        emit();
        socket?.on('connect', emit);
        return () => {
            socket?.off('connect', emit);
        }
    }, [venue]);

    return schedule?.every(item => (
        item?.start !== item?.end
    )) && <View style={{ gap: 0 }} onLayout={setStep$.bind(null, "schedule")}>
        <Text style={{ fontWeight: '600', fontSize: 16 }}>{t(`venue.schedule`)}</Text>

        {schedule.filter(item => item?.active && item?.weekDay).sort((a, b) => a.weekDay - b.weekDay).map(item => {
            const closedList = schedule.filter(item => item?.closed).map(item => item?.date);
            const thisDayDate = moment().locale('fr').startOf('day').days(item?.weekDay).format('YYYY-MM-DD');
            const isClosed = closedList.includes(thisDayDate);

            const getHr = (v) => moment().locale('fr').startOf('day').minutes(v * 60).format('H:mm');
            const start = getHr(item?.start);
            const end = getHr(item?.end);

            return (
                item?.active &&
                ( item?.start !== item?.end )
            ) && <View key={item?.weekDay} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Text
                    style={{
                        fontWeight: '600',
                        color: item?.weekDay === moment().day() ? colors.primary : undefined
                    }}>
                    {moment().locale('fr').isoWeekday(item?.weekDay).format('dddd')}
                </Text>
                <Text
                    style={{
                        color: item?.weekDay === moment().day() ? colors.primary : "#aaa"
                    }}>
                    {isClosed ? 'Fermé' : `${start} - ${end}`}
                </Text>
            </View>
        })}
    </View>
}