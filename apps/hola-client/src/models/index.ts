import mongoose from "mongoose";

export const Clients = mongoose.model("Client", new mongoose.Schema({
    visitorId: { type: mongoose.Schema.Types.ObjectId }
}));

export const Sessions = mongoose.model("Session", new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    active: { type: Boolean, default: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now }
}));

