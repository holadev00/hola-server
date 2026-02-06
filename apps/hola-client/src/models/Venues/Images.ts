import mongoose from "mongoose";

export const ImagesSchema = new mongoose.Schema({
    venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
    image: String
});

export const Images = mongoose.model("Image", ImagesSchema);