import mongoose from "mongoose";

export const LocationsSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue" },
    //latitude: { type: Number, required: true },
    //longitude: { type: Number, required: true },
    adress: { type: String },
    createdAt: { type: Date, default: Date.now },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: ([lng, lat]) =>
                    lng >= -180 && lng <= 180 &&
                    lat >= -90 && lat <= 90,
                message: 'Coordonnées invalides'
            }
        },
        reverse: Object
    }
});

LocationsSchema.index({ location: '2dsphere' });

LocationsSchema.pre('save', function (next) {
    console.log(this.isModified('latitude'), this.isModified('longitude'));
    if (this.isModified('latitude') || this.isModified('longitude')) {
        this.location = {
            type: 'Point',
            coordinates: [this.longitude, this.latitude]
        };
    }
    next();
});

export const Locations = mongoose.model("Location", LocationsSchema);
