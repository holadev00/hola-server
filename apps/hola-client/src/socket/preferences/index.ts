import { event } from "@legendapp/state";
import { Preferences } from "../../models/Preferences";
import mongoose from "mongoose";

export function bind(socket) {
    type Preferences = {
        language: string;
        level: string;
        position: string;
        active: boolean;
    }

    const userUpdate = event();

    console.log('bind', socket.session.currentUser.get(), socket.session.client);
    const userCriteria = (!!socket.session.currentUser.get() && typeof socket.session.currentUser.get() === "string") ? {
        $or: [
            { user: new mongoose.Types.ObjectId(socket.session.currentUser.get()) },
            { client: new mongoose.Types.ObjectId(socket.session.client) }
        ]
    } : undefined;
    const clientCriteria = { client: new mongoose.Types.ObjectId(socket.session.client) };
    const criteria = { $or: [userCriteria, clientCriteria] };

    async function getPreferences() {
        const clientId = new mongoose.Types.ObjectId(socket.session.client);
        const userId = socket.session.currentUser?.get
            ? new mongoose.Types.ObjectId(socket.session.currentUser.get())
            : null;

        console.log('getPreferences', clientId, userId);

        const pipeline = [
            {
                $match: {
                    active: true,
                    $or: [
                        { client: clientId },
                        ...(userId ? [{ user: userId }] : [])
                    ]
                }
            },
            {
                // tag pour savoir d'où vient le doc
                $addFields: {
                    isClient: { $eq: ["$client", clientId] }
                }
            },
            {
                $group: {
                    _id: null,
                    prefs: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    clientPref: {
                        $first: {
                            $filter: {
                                input: "$prefs",
                                as: "p",
                                cond: { $eq: ["$$p.client", clientId] }
                            }
                        }
                    },
                    userPref: {
                        $first: {
                            $filter: {
                                input: "$prefs",
                                as: "p",
                                cond: { $eq: ["$$p.user", userId] }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    merged: {
                        $mergeObjects: [
                            "$userPref",
                            {
                                language: "$clientPref.language",
                                client: "$clientPref.client",
                            }
                        ]
                    }
                }
            },
            { $replaceRoot: { newRoot: "$merged" } },
        ];

        return (await Preferences.aggregate(pipeline))[0];
    }

    async function emitUpdate() {
        return socket.emit('PREFERENCES/update', await getPreferences());
    }

    const setPreferences = async (p: Preferences) => {
        const options = { upsert: true, new: true };
        await Preferences.findOneAndUpdate(userCriteria, p, options);
        await Preferences.findOneAndUpdate(clientCriteria, p, options);
        console.log('setPreferences', criteria, p, options);
        userUpdate.fire();
    };

    socket.session.users.onChange(emitUpdate, { initial: true, immediate: true });
    userUpdate.on(emitUpdate);
    userUpdate.on(() => console.log('userUpdate'));

    socket.on('PREFERENCES/get', async (cb) => cb(await getPreferences()));
    socket.on('PREFERENCES/set', async (p, cb) => {
        await setPreferences(p);
        cb({ ok: true });
    });
}