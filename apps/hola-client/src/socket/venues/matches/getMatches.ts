import mongoose from "mongoose";
import { Matches } from "../../../models/Venues/Matches";

export async function getMatches({ venue, match, clientId, userId }: any) {
    console.log("getMatches", venue, match, clientId, userId);

    const retrieveNextMatches = {
        $match: {
            $and: [
                {
                    ...(match && { _id: new mongoose.Types.ObjectId(match) }),
                    $or: [
                        { private: false },
                        { private: { $exists: false } },
                        {
                            private: true,
                            "createdBy.client": new mongoose.Types.ObjectId(clientId),
                            "createdBy.user": new mongoose.Types.ObjectId(userId),
                        },
                    ]
                },
                {
                    active: true,
                    //date: { $gte: new Date().toISOString().slice(0, 10) }
                },
                {
                    $expr: {
                        $gte: [
                            {
                                $dateFromString: {
                                    dateString: "$date",
                                    format: "%Y-%m-%d"
                                }
                            },
                            "$$NOW"
                        ]
                    }
                }
            ]
        },
    };

    const lookupAndAddCourt = [{
        $lookup: {
            from: "courts",
            localField: "court",
            foreignField: "_id",
            as: "court",
        },
    },
    { $unwind: "$court" },
    {
        $addFields: {
            court: {
                name: "$court.name",
                indoor: "$court.indoor",
                filmed: "$court.filmed",
                sport: "$court.sport",
            },
        }
    }];


    const lookupCourtImages = venue
        ? [
            {
                $match: {
                    "court.venue": new mongoose.Types.ObjectId(venue),
                },
            },
        ]
        : [];

    const retrieveVenue = [
        {
            $lookup: {
                from: "venues",
                localField: "court.venue",
                foreignField: "_id",
                as: "venue",
            },
        },
        { $unwind: "$venue" },
        {
            $lookup: {
                from: "locations",
                localField: "venue._id",
                foreignField: "venue",
                as: "location",
            },
        },
        { $unwind: "$location" },

        {
            $addFields: {
                location: "$location.location",
            }
        },
        {
            $lookup: {
                from: "images",
                localField: "venue._id",
                foreignField: "venue",
                as: "venue.images",
            },
        }
    ];

    const lookupCreatedBy = [
        {
            $lookup: {
                from: "users",
                localField: "createdBy.user",
                foreignField: "_id",
                as: "createdBy.user",
            },
        },
        { $unwind: "$createdBy.user" },

        {
            $lookup: {
                from: "clients",
                localField: "createdBy.client",
                foreignField: "_id",
                as: "createdBy.client",
            },
        },
        { $unwind: "$createdBy.client" },

        {
            $addFields: {
                "createdBy.self": {
                    $and: [
                        {
                            $eq: ["$createdBy.user._id", new mongoose.Types.ObjectId(userId)],
                        },
                        {
                            $eq: ["$createdBy.client._id", new mongoose.Types.ObjectId(clientId)],
                        },
                    ],
                }
            }
        }
    ];

    console.log(
        await Matches.aggregate([
            retrieveNextMatches,
            ...lookupAndAddCourt,
            ...lookupCourtImages,
            ...retrieveVenue,
            ...lookupCreatedBy
        ])
    );

    return Matches.aggregate(
        [
            retrieveNextMatches,
            ...lookupAndAddCourt,
            ...lookupCourtImages,
            ...retrieveVenue,
            ...lookupCreatedBy,

            /* ---------- Participations ---------- */
            {
                $lookup: {
                    from: "participations",
                    localField: "_id",
                    foreignField: "match",
                    as: "participations",
                },
            },
            {
                $unwind: {
                    path: "$participations",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "participations.user",
                    foreignField: "_id",
                    as: "participations.user",
                },
            },
            {
                $unwind: {
                    path: "$participations.user",
                    preserveNullAndEmptyArrays: true,
                },
            },

            {
                $lookup: {
                    from: "clients",
                    localField: "participations.client",
                    foreignField: "_id",
                    as: "participations.client",
                },
            },
            {
                $unwind: {
                    path: "$participations.client",
                    preserveNullAndEmptyArrays: true,
                },
            },

            {
                $addFields: {
                    "participations.self": {
                        $and: [
                            {
                                $eq: [
                                    "$participations.user._id",
                                    new mongoose.Types.ObjectId(userId)
                                ]
                            },
                            {
                                $eq: [
                                    "$participations.client._id",
                                    new mongoose.Types.ObjectId(clientId)
                                ]
                            }
                        ]
                    }
                }
            },

            {
                $addFields: {
                    images: {
                        $concatArrays: [
                            {
                                $map: {
                                    input: { $ifNull: ["$venue.images", []] },
                                    as: "img",
                                    in: { $mergeObjects: ["$$img", { source: "venue" }] }
                                }
                            },
                            {
                                $map: {
                                    input: { $ifNull: ["$court.images", []] },
                                    as: "img",
                                    in: { $mergeObjects: ["$$img", { source: "court" }] }
                                }
                            }
                        ]
                    }
                }
            },

            /* ---------- Regroupement ---------- */
            {
                $group: {
                    _id: "$_id",
                    court: { $first: "$court" },
                    venue: { $first: "$venue" },
                    location: { $first: "$location" },
                    images: { $first: "$images" },
                    createdBy: { $first: "$createdBy" },
                    date: { $first: "$date" },
                    start: { $first: "$start" },
                    end: { $first: "$end" },
                    level: { $first: "$level" },
                    participations: { $push: "$participations" },
                    description: { $first: "$description" },
                    active: { $first: "$active" },
                    private: { $first: "$private" },
                }
            },

            {
                $addFields: {
                    createdBy: {
                        self: "$createdBy.self",
                        avatar: "$createdBy.user.avatar",
                        isGuest: { $eq: ["$createdBy.user._id", null] },
                        displayname: {
                            $ifNull: [
                                "$createdBy.user.displayname",
                                { $ifNull: [{ $concat: ["@", "$createdBy.user.username"] }, "$createdBy.client._id"] }
                            ]
                        }
                    }
                }
            },

            { $unset: "court.venue" },
            { $unset: "court._id" },
            { $unset: "court.images" },
            { $unset: "venue._id" },
            { $unset: "venue.images" },
            { $unset: "createdBy.user" },
            { $unset: "createdBy.client" },
            //{ $unset: "images._id" },
            { $unset: "images.venue" },
            { $unset: "images.court" },

            {
                $addFields: {
                    participations: {
                        $filter: {
                            input: {
                                $map: {
                                    input: "$participations",
                                    as: "p",
                                    in: {
                                        _id: "$$p._id",
                                        self: "$$p.self",
                                        isGuest: {
                                            $eq: ["$$p.user._id", null]
                                        },
                                        avatar: "$$p.user.avatar",
                                        displayname: {
                                            $ifNull: [
                                                "$$p.user.displayname",
                                                {
                                                    $ifNull: [
                                                        { $concat: ["@", "$$p.user.username"] },
                                                        ["$$p.client._id"]
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                }
                            },
                            as: "p",
                            cond: { $ne: ["$$p._id", null] }
                        }
                    }
                }
            }
        ]
    );
}
