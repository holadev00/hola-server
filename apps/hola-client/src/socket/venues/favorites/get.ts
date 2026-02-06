import { Favorites } from "../../../models/Venues/Favorites";
import type { InjectedSocket } from "../../../session/types";

export default async function getFavoritesVenues(socket: InjectedSocket, venueID, cb) {
    const favorites = await Favorites.findOne({
        user: socket?.session?.currentUser?.get(),
        client: socket?.session?.client,
        venue: venueID,
        active: true
    }).lean();

    cb(favorites?.active);
}