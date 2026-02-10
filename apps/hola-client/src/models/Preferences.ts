import mongoose from "mongoose";

export const PreferencesSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    language: { type: String },
    level: { type: String, enum: ["beginner", "intermediate", "advanced", "mixed"] },
    position: { type: String, enum: ["goalkeeper", "defender", "midfielder", "striker"] },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

export const Preferences = mongoose.model("Preference", PreferencesSchema);