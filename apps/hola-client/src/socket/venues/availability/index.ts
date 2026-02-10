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

    const lookupPricing = {
        $lookup: {
            from: "courtpricings",
            let: {
                courtId: "$_id",
                slotStart: "$slotStart",
                slotEnd: "$slotEnd",
                weekDay,
                date: "$schedule.date"
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $in: ["$$courtId", "$courts"] },
                                { $eq: ["$active", true] },

                                // jour de semaine
                                {
                                    $or: [
                                        // pricing valable tous les jours
                                        { $not: ["$dayOfWeek"] },

                                        // jour précis match
                                        { $in: ["$$weekDay", "$dayOfWeek"] },
                                    ]
                                },

                                // heure du slot
                                { $lte: [{ $multiply: ["$startHour", 60] }, "$$slotStart"] },
                                { $gte: [{ $multiply: ["$endHour", 60] }, "$$slotEnd"] },

                                // validité temporelle
                                {
                                    $or: [
                                        { $not: ["$validFrom"] },
                                        { $lte: ["$validFrom", "$$date"] }
                                    ]
                                },
                                {
                                    $or: [
                                        { $not: ["$validTo"] },
                                        { $gte: ["$validTo", "$$date"] }
                                    ]
                                }
                            ]
                        }
                    }
                },

                // priorité PREMIUM > PEAK
                {
                    $addFields: {
                        priority: {
                            $cond: [
                                { $eq: ["$type", "PREMIUM"] }, 2, 1
                            ]
                        }
                    }
                },

                { $sort: { priority: -1 } },
                { $limit: 1 }
            ],
            as: "slotPricing"
        }
    };

    const availabilities = await Courts.aggregate([
        findCourts,

        {
            $lookup: {
                from: "venues",
                localField: "venue",
                foreignField: "_id",
                as: "venueData"
            }
        },
        { $unwind: "$venueData" },
        {
            $addFields: {
                courtVenuePricing: "$venueData.pricing"
            }
        },

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
                        {
                            $multiply: [{
                                $ifNull: ["$schedule.start", 0]
                            }, 60]
                        },
                        {
                            $multiply: [{
                                $ifNull: ["$schedule.end", 24]
                            }, 60]
                        },
                        {
                            $multiply: [{
                                $ifNull: ["$schedule.interval", 1]
                            }, 60]
                        }
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

        lookupPricing,

        {
            $addFields: {
                pricePerPlayerPerHour: {
                    $ifNull: [
                        { $arrayElemAt: ["$slotPricing.pricePerPlayerPerHour", 0] },
                        "$venueData.pricing.defaultPricePerPlayerPerHour"
                    ]
                },
                currency: "$venueData.pricing.currency"
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
                    venue: "$court.venue",
                },
                start: "$slotStart",
                end: "$slotEnd",
                slot: "$schedule.slots",
                pricePerPlayerPerHour: 1,
                priceTotal: {
                    $multiply: [
                        "$pricePerPlayerPerHour",
                        { $divide: [{ $subtract: ["$slotEnd", "$slotStart"] }, 60] }
                    ]
                },
                currency: 1,
            }
        },

        {
            $sort: {
                start: 1
            }
        }

    ]);

    cb(availabilities);
    return availabilities;
}