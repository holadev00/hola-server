import mongoose, { Schema } from "mongoose";

export const FavoriteSchemas = new Schema({
    client: { type: Schema.Types.ObjectId, ref: "Client" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    venue: { type: Schema.Types.ObjectId, ref: "Venue" },
    active: { type: Boolean, default: true },
})

export const Favorites = mongoose.model("Favorite", FavoriteSchemas);