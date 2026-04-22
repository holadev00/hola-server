import moment from "moment";
import { Schedules } from "../../../models/Venues/Schedules";
import { Options } from "../../../models/Venues/Options";

export default async function getVenuesSchedules(socket, venue, cb) {
    const schedules = await Schedules.find({
        venue,
        active: true,
        $or: [
            { date: { $exists: false } },
            { date: { $gte: new Date().toISOString().slice(0, 10) } }
        ]
    }).lean();

    const week = Array(7).fill(null).map((_, wD) => moment().startOf('week').add(wD, 'days'));
    const weekSchedule = week.map((day, weekDay) => {
        const base = schedules.find(s => s.date === day.format('YYYY-MM-DD')) ??
            schedules.find(s => s.weekDay === weekDay) ??
            schedules.find(s => s.weekDay === "*");

        return {
            ...base,
            weekDay,
            active: true,
        }
    });

    cb(weekSchedule);
}

/* Options.insertMany([
    { venue: "6977ee194ba1ee3581c49340", option: "food", active: true },
    { venue: "6977ee194ba1ee3581c49340", option: "parking", active: true },
    { venue: "6977ee194ba1ee3581c49340", option: "shower", active: true },
    { venue: "6977ee194ba1ee3581c49340", option: "drink", active: true },
    { venue: "6977ee194ba1ee3581c49340", option: "toilets", active: true }
]) */