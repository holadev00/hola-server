import geocoding from '@aashari/nodejs-geocoding';
import { Locations } from '../../../models/Locations';

export default async (socket, { lat, lng }, cb) => {
    /*geocoding
        .decode(userInput.lat, userInput.lng)
        .then(cb)
        .catch((error) => console.error(error));*/
    
    const location = await Locations.findOne({
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat]
                }
            }
        }
    });

    if (location?.location?.reverse) {
        cb(location?.location?.reverse);
        return;
    }

    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then(res => res.json())
        .then(async (data) => {
            const result = await Locations.updateMany(
                {
                    location: {
                        $near: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [lng, lat]
                            }
                        }
                    }
                }, 
                {
                    $set: {
                        'location.reverse': data
                    }
                }
            );

            cb(data);
        });
}