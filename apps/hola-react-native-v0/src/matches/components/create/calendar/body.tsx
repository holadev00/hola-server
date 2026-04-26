import { Pressable, StyleSheet, Text, View } from "react-native";
import moment from "moment";
import colors from "@hola/ui/colors";
import { Computed } from "@legendapp/state/react";
import { currentDay } from "../../../screens/create/state";

export function CalendarBody() {
    return (
        <Computed>
            {() => {
                const startDay = moment().add(currentDay.get(), "days").startOf("month").startOf("week");
                const endDay = moment().add(currentDay.get(), "days").endOf("month").endOf("week");

                const days = Array.from(
                    { length: endDay.diff(startDay, "days") + 1 },
                    (_, i) => moment(startDay).add(i, "days")
                );

                const weeks = days.reduce((acc, day) => {
                    const weekKey = day.week(); // ⬅️ dimanche → samedi

                    if (!acc[weekKey]) {
                        acc[weekKey] = [];
                    }

                    acc[weekKey].push(day);
                    return acc;
                }, {});

                return Object.values(weeks).map((week, weekIndex) => (
                    <View key={weekIndex} style={{ flexDirection: "row" }}>
                        {week.map((day, dayIndex) => {
                            const currentDayImage = moment().startOf("day").add(currentDay.get(), "days").diff(moment().startOf("day"), "days");
                            const thisDayAsCurrentDay = day.diff(moment().startOf("day"), "days");
                            const isSelected = thisDayAsCurrentDay === currentDayImage;
                            const isToday = thisDayAsCurrentDay === 0;
                            const isPast = thisDayAsCurrentDay < 0;
                            const isInTheMonth = day.month() === moment().add(currentDay.get(), "days").month();

                            return (
                                <Pressable key={dayIndex} style={{ flex: 1, aspectRatio: 5 / 4, justifyContent: "center", alignItems: "center", position: "relative" }} onPress={() => !isPast && currentDay.set(thisDayAsCurrentDay)}>
                                    {isToday && <View style={[styles.dayBackground, { backgroundColor: colors.secondary }]} />}
                                    {isSelected && <View style={[styles.dayBackground, { backgroundColor: colors.primary }]} />}
                                    {!isToday && !isSelected && <View style={[styles.dayBackground, { backgroundColor: isInTheMonth && !isPast ? colors.opacity : "#0000" }]} />}
                                    
                                    <Text style={{ textAlign: "center", color: !isInTheMonth ? "#ddd" : (isSelected || isToday) ? "white" : isPast ? "#bbb" : "black" }}>
                                        {day.format("DD")}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                ));
            }}
        </Computed>
    );
}


const styles = StyleSheet.create({
    dayBackground: {
        position: "absolute",
        width: "75%",
        aspectRatio: 1,
        borderRadius: 999,
    },
});