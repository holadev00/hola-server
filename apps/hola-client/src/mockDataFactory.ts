import mongoose from "mongoose";
import "../mongoose";
import { Venues } from "./models/Venues";
import { Locations } from "./models/Locations";
import { Schedules } from "./models/Venues/Schedules";
import { Courts } from "./models/Venues/Courts";
import CourtPricing from "./models/Venues/CourtPricing";

const venueTest = new mongoose.Types.ObjectId('69870eb880b354696a21f869');

Venues.findByIdAndUpdate(
    venueTest,
    {
        $set: {
            name: "Test",
            active: true
        }
    },
    { new: true, upsert: true },
).then((r) => {
    Locations.findOneAndUpdate(
        { venue: r._id },
        {
            $set: {
                active: true,
                location: {
                    type: "Point",
                    coordinates: [2.3522, 48.8566]
                }
            }
        },
        { new: true, upsert: true },
    ).then((r) => console.log(r));

    Schedules.findOneAndUpdate(
        {
            venue: r._id,
            weekDay: "*"
        },
        {
            $set: {
                active: true,
                start: 0,
                end: 14
            }
        },
        { new: true, upsert: true },
    ).then((r) => console.log(r));

    Courts.findOneAndUpdate(
        {
            venue: r._id
        },
        {
            $set: {
                sport: "tennis",
                active: true,
                indoor: true
            }
        },
        { new: true, upsert: true },

    ).then(async (r) => {
        console.log("r", r);
        const updatedPricing = await CourtPricing.findOneAndUpdate(
            {
                "courts._id": r._id,
                active: true
            },
            {
                $set: {
                    pricePerPlayerPerHour: 12,
                    startHour: 11,
                    endHour: 13,
                    dayOfWeek: [1, 2, 3, 4, 5]
                }
            },
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        console.log(updatedPricing);
    });
});
