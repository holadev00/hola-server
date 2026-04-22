import mongoose from "mongoose";

export const OptionSchema = new mongoose.Schema({
    venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
    option: { type: String, required: true, enum: ["food", "parking", "shower", "drink", "toilets"] },
    active: Boolean
});

export const Options = mongoose.model("Option", OptionSchema);