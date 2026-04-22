import mongoose from "mongoose";
import { User } from "../../models/User";

export async function get(socket, id, cb) {
    try {
        const thisUser = socket.session.currentUser.get();
        if (!thisUser) return cb({ authenticated: false });
    
        const profileToGet = new mongoose.Types.ObjectId((id === null) ? thisUser : id);
    
        const data = await User.aggregate([
            {
                $match: {
                    _id: profileToGet
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    avatar: 1,
                    displayname: 1,
                    private: 1
                }
            },
            {
                $lookup: {
                    from: 'preferences',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'preferences'
                }
            },
            {
                $unwind: {
                    path: '$preferences',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    "preferences": {
                        $cond: {
                            if: { 
                                $or: [
                                    { $eq: ["$$CURRENT.private", true] },
                                    { $eq: ["$$CURRENT._id", thisUser] }
                                ]
                            },
                            then: "$$CURRENT.preferences",
                            else: null
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    avatar: 1,
                    displayname: 1,
                    private: 1,
                    preferences: 1
                }
            }
        ]);
    
        if (data.length === 0) return cb({ found: false });
    
        return cb({ ...data[0], _self: (id === null) });
    } catch (error) {
        return cb({ error });
    }
}