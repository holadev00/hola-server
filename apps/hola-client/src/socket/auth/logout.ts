import mongoose from "mongoose";
import { Sessions } from "../../models";

export const logout = async (s) => {
    const criteria = {
        client: new mongoose.Types.ObjectId(s.session?.client),
        user: new mongoose.Types.ObjectId(s.session?.currentUser.get())
    };
    await Sessions.updateOne(criteria, { active: false });
    s.session.refresh();
};
