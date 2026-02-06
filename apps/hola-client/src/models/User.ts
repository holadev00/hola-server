import mongoose from "mongoose";

export const User = mongoose.model("User", new mongoose.Schema({
    username: String,
    phone: String,
    avatar: String,
    displayname: String,
    bio: String,
    email: String,
    password: String,
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}));
export async function checkUserByIdentifiant(identifiant: any) {
    return await User.findOne({
        $or: [
            { email: identifiant },
            { username: identifiant },
            { phone: identifiant },
        ],
    });
}
