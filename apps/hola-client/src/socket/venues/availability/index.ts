import moment from "moment";
import mongoose from "mongoose";
import { Courts } from "../../../models/Venues/Courts";

type Settings = {
    sport: string;
    filmed: boolean | null;
    indoor: boolean | null;
}

export default async (socket, id, daysFromNow, settings: Settings, cb) => {
    if (!cb) return;

    function parseValue(value) {
        if (typeof value !== 'string') return value;

        const v = value.trim().toLowerCase();

        if (v === 'null' || v === null) return null;
        if (v === 'undefined' || v === undefined) return undefined;
        if (v === 'true' || v === true) return true;
        if (v === 'false' || v === false) return false;

        if (!Number.isNaN(Number(v))) return Number(v);

        return value;
    }

    const venue = new mongoose.Types.ObjectId(id);
    const date = moment().add(daysFromNow, 'days').format('YYYY-MM-DD');
    const weekDay = moment(date).day();
    const nowMinutes =
        date === moment().format('YYYY-MM-DD')
            ? moment().hours() * 60 + moment().minutes()
            : -1;

    const findCourts = {
        $match: {
            venue,
            active: true,
            ...(parseValue(settings?.sport) && { "sport": settings.sport }),
            ...((parseValue(settings?.filmed) !== undefined && parseValue(settings?.filmed) !== null) && { "filmed": parseValue(settings.filmed) }),
            ...((parseValue(settings?.indoor) !== undefined && parseValue(settings?.indoor) !== null) && { "indoor": parseValue(settings.indoor) }),
        }
    }

    const availabilities = await Courts.aggregate([
        findCourts,

        {
            $lookup: {
                from: "matches",
                let: { courtId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$court", "$$courtId"] },
                                    { $eq: ["$date", date] },
                                    { $eq: ["$active", true] },
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            start: 1,
                            end: 1
                        }
                    }
                ],
                as: "matches"
            }
        },

        {
            $lookup: {
                from: "schedules",
                let: { venue },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$venue", "$$venue"] },
                            active: true,
                            $or: [
                                { date },
                                { weekDay },
                                { weekDay: "*" }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            priority: {
                                $cond: [
                                    { $eq: ["$date", date] }, 3,
                                    {
                                        $cond: [
                                            { $eq: ["$weekDay", weekDay] }, 2,
                                            1
                                        ]
                                    }
                                ]
                            }
                        }
                    },
                    { $sort: { priority: -1 } },
                    { $limit: 1 }
                ],
                as: "schedule"
            }
        },

        { $unwind: "$schedule" },

        {
            $addFields: {
                hours: {
                    $range: [
                        { $multiply: ["$schedule.start", 60] },
                        { $multiply: ["$schedule.end", 60] },
                        { $multiply: ["$schedule.interval", 60] }
                    ]
                }
            }
        },

        { $unwind: "$hours" },

        {
            $unwind: "$schedule.slots"
        },

        {
            $addFields: {
                slotStart: "$hours",
                slotEnd: { $add: ["$hours", { $multiply: ["$schedule.slots", 60] }] },
            }
        },

        {
            $match: {
                $expr: {
                    $lte: ["$slotEnd", { $multiply: ["$schedule.end", 60] }]
                }
            }
        },

        {
            $match: {
                $expr: {
                    $or: [
                        { $lt: [nowMinutes, 0] },
                        { $gt: ["$slotStart", nowMinutes] }
                    ]
                }
            }
        },

        {
            $addFields: {
                overlap: {
                    $anyElementTrue: {
                        $map: {
                            input: "$matches",
                            as: "m",
                            in: {
                                $and: [
                                    { $lt: [{ $multiply: ["$$m.start", 60] }, "$slotEnd"] },
                                    { $gt: [{ $multiply: ["$$m.end", 60] }, "$slotStart"] }
                                ]
                            }
                        }
                    }
                }
            }
        },

        {
            $match: {
                overlap: false
            }
        },

        {
            $addFields: {
                court: "$$ROOT"
            }
        },

        {
            $project: {
                _id: 0,
                court: {
                    id: "$court._id",
                    name: "$court.name",
                    sport: "$court.sport",
                    indoor: "$court.indoor",
                    filmed: "$court.filmed",
                    venue: "$court.venue"
                },
                start: "$slotStart",
                end: "$slotEnd",
                slot: "$schedule.slots"
            }
        },

        {
            $sort: {
                start: 1
            }
        }

    ]);

    //console.log(availabilities);
    cb(availabilities);
    return availabilities;
}