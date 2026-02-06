import mongoose from "mongoose";

export const OptionSchema = new mongoose.Schema({
    venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
    option: String,
    active: Boolean
});

export const Options = mongoose.model("Option", OptionSchema);