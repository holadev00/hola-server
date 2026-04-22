import { Venues } from "../../../models/Venues";
import { Locations } from "../../../models/Locations";

export default async function getVenuesMap(socket, bounds, cb) {
    try {
        if (!cb) return;

        const {
            latMin,
            latMax,
            lngMin,
            lngMax
        } = bounds;

        // 1️⃣ Centre
        const centerLat = (latMin + latMax) / 2;
        const centerLng = (lngMin + lngMax) / 2;

        // 2️⃣ Rayon = distance centre → coin le plus éloigné
        const radiusKm = haversineKm(
            centerLat,
            centerLng,
            latMax,
            lngMax
        );

        // 3️⃣ Recherche géospatiale
        const venues = await Locations.aggregate([
            {
                $geoNear: {
                    near: {
                        type: 'Point',
                        coordinates: [centerLng, centerLat]
                    },
                    distanceField: 'distance',
                    maxDistance: radiusKm * 1000,
                    spherical: true,
                    key: 'location'
                }
            },

            // 1️⃣ uniquement les locations liées à un venue
            {
                $match: {
                    venue: { $exists: true, $ne: null }
                }
            },

            // 2️⃣ join Venue
            {
                $lookup: {
                    from: 'venues', // ⚠️ nom réel de la collection
                    localField: 'venue',
                    foreignField: '_id',
                    as: 'venue'
                }
            },

            // 3️⃣ unwind
            { $unwind: '$venue' },

            // 4️⃣ format de sortie
            {
                $project: {
                    _id: 0,
                    id: '$venue._id',
                    name: '$venue.name',
                    address: '$venue.address',
                    latitude: { $arrayElemAt: ['$location.coordinates', 1] },
                    longitude: { $arrayElemAt: ['$location.coordinates', 0] }
                }
            }
        ]);

        cb({
            radiusKm,
            venues
        });
    } catch (error) {
        console.error('getVenuesMap error:', error);
        if (!cb) return; cb([]);
    }
}

function toRad(deg: number) {
    return deg * Math.PI / 180;
}

function haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371; // rayon Terre en km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(a));
}