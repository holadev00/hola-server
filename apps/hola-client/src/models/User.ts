import mongoose from "mongoose";
import * as passwords from "../passwords";

const UserSchema = new mongoose.Schema({
    username: String,
    phone: String,
    avatar: String,
    displayname: String,
    bio: String,
    email: String,
    password: String,
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    private: { type: Boolean, default: false },
});

export const User = mongoose.model("User", UserSchema);



export async function checkUserByIdentifiant(identifiant: any) {
    return await User.findOne({
        $or: [
            { email: identifiant },
            { username: identifiant },
            { phone: identifiant },
        ],
    });
}
