import { client } from "socket-session-manager";
import { Locations } from "../../../models/Locations";

export default async function getLocation(
    socket,
    cb: (location: { latitude: number; longitude: number } | null) => void
) {
    try {
        //console.log('getLocation', socket.session?.currentUser?.get?.(), socket.session?.client);
        const criteria = {
            $or: [
                { user: socket.session?.currentUser?.get?.(), client: socket.session?.client },
                { client: socket.session?.client }
            ]
        };

        const location = await Locations
            .findOne(criteria)
            .sort({ createdAt: -1 }) // dernière position
            .select('location')
            .lean();

        //console.log('location', location);
        if (!location?.location?.coordinates) {
            cb(null);
            return;
        }

        //console.log('location', location.location.coordinates);

        cb({
            latitude: location?.location?.coordinates[1]!,
            longitude: location?.location?.coordinates[0]!
        });
    } catch (err) {
        //console.error('getLocation error:', err);
        cb(null);
    }
}