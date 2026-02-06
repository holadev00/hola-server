import { Locations } from "../../../models/Locations";
import type { InjectedSocket } from "../../../session/types";

export default async function setUserLocation(socket: InjectedSocket, location: { latitude: number; longitude: number }) {
    try {
        const criteria = {
            user: socket.session?.currentUser.get(),
            client: socket.session?.client
        };

        await Locations.findOneAndUpdate(
            criteria,
            {
                location: {
                    type: 'Point',
                    coordinates: [location.longitude, location.latitude]
                }
            },
            { upsert: true }
        );
    } catch (error) {
        console.error('setUserLocation error:', error);
    }
}
