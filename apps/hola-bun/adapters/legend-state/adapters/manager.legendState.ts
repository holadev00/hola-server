import { observable } from "@legendapp/state";

export default class {
    lstnrOpt = { initial: true, immediate: true }

    constructor() { }

    createStore() {
        const $ = observable({
            dashboard: {
                venueId: null,
                venueName: "",
                active: false,
                thisMonthRevenue: 0,
                reservationsCount: 0,
                occupancyRate: 0,
                averageScore: 0,
                thisWeekRevenue: [
                    { day: "Monday", revenue: 0, },
                    { day: "Tuesday", revenue: 0, },
                    { day: "Wednesday", revenue: 0, },
                    { day: "Thursday", revenue: 0, },
                    { day: "Friday", revenue: 0, },
                    { day: "Saturday", revenue: 0, },
                    { day: "Sunday", revenue: 0, },
                ],
                todayReservations: [] as [],
            },
            reservations: [] as Reseevation[],
            courts: [] as Court[],
            recentPlayers: {
                players: [] as Player[],
                totalPlayersCount: 0,
                thisMonthPlayersCount: 0,
            }
        });

        return $;
    }

    onChange($, callback, unsubscribe) {
        const onChange = ({ value, getPrevious }) => {
            const prev = getPrevious();
            callback(value, prev);
        }

        const uns = $.onChange(onChange, this.lstnrOpt);
        unsubscribe(uns);
    }
}