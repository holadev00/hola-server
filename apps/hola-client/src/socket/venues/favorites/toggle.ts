import { Favorites } from "../../../models/Venues/Favorites";

export default async function toggleFavoritesVenues(socket, venueID, active, cb) {
    await Favorites.findOneAndUpdate({
        user: socket?.session?.currentUser?.get(),
        client: socket?.session?.client,
        venue: venueID
    }, { active: !active }, { upsert: true, new: true });

    socket.emit('VENUES/favorite/update', {
        venueID,
        active: !active
    });
}