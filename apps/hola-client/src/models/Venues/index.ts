import mongoose from "mongoose";

export const VenueSchema = new mongoose.Schema({
    name: String,
    options: [{
        option: String,
        active: Boolean
    }],
    images: [{
        image: String,
        active: Boolean
    }]
})

VenueSchema.virtual('courts', {
    ref: 'Court',
    localField: '_id',
    foreignField: 'venue',
    justOne: false
});

VenueSchema.virtual('schedules', {
    ref: 'Schedule',
    localField: '_id',
    foreignField: 'venue',
    justOne: false
});

VenueSchema.virtual('options', {
    ref: 'Option',
    localField: '_id',
    foreignField: 'venue',
    justOne: false
});

export const Venues = mongoose.model("Venue", VenueSchema);
