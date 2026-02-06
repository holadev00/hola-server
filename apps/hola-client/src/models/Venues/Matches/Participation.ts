import mongoose from "mongoose";

const ParticipationSchema = new mongoose.Schema({
    match: { type: mongoose.Schema.Types.ObjectId, ref: "Match", required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    joinedAt: { type: Date, default: Date.now },
});

export const Participations = mongoose.model("Participation", ParticipationSchema);