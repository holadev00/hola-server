import { Pressable, Text, View } from "react-native";
import moment from "moment";
import { Computed } from "@legendapp/state/react";
import { Feather } from "@expo/vector-icons";
import { currentDay } from "../../../screens/create/state";

export function CalendarHeader() {
    function prevMonth() {
        currentDay.set(
            moment.max(
                moment().add(currentDay.get(), "days").subtract(1, "month").startOf("month"),
                moment().startOf("day")
            ).diff(moment().startOf("day"), "days")
        );
    }

    function nextMonth() {
        currentDay.set(
            moment().add(currentDay.get(), "days").add(1, "month").startOf("month").diff(moment().startOf("day"), "days")
        );
    }

    return <View>
        <Computed>
            {() => {
                const isPrevMonthPast = moment().add(currentDay.get(), "days").startOf("month").diff(moment().startOf("day"), "days") < 0;

                return (
                    <View style={{ flexDirection: "row" }}>
                        <Pressable onPress={() => !isPrevMonthPast && prevMonth()}>
                            <Feather name="chevron-left" size={24} color={isPrevMonthPast ? "#ddd" : "black"} />
                        </Pressable>
                        <Pressable style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ fontWeight: "bold" }}>{moment().add(currentDay.get(), "days").format("MMMM YYYY")}</Text>
                        </Pressable>
                        <Pressable onPress={nextMonth}>
                            <Feather name="chevron-right" size={24} color="black" />
                        </Pressable>
                    </View>
                );
            }}
        </Computed>
        <View style={{ flexDirection: "row" }}>
            {Array.from({ length: 7 }, (_, i) => <View key={i} style={{ flex: 1, aspectRatio: 3 / 2, justifyContent: "center", alignItems: "center" }}>
                <Text key={i}>{moment().isoWeekday(i).format("ddd")}</Text>
            </View>)}
        </View>
    </View>
}