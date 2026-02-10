import mongoose from "mongoose";
import { Sessions } from "../../../models";

export const _bindUserToClient = async (s, user) => {
    const criteria = {
        client: new mongoose.Types.ObjectId(s.session?.client),
        user: new mongoose.Types.ObjectId(user._id)
    };

    const set = { active: true };

    await Sessions.findOneAndUpdate(criteria, set, { upsert: true, new: true });

    s.session.refresh();
};
