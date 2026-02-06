import { getMatches } from "./getMatches";

export default async function getVenuesMatches(socket, venue, cb) {
    if (!cb) return;

    const clientId = socket?.session?.client;
    const userId = socket?.session?.currentUser?.get();

    const matches = await getMatches({ venue, clientId, userId });

    cb(matches);
}


