import { Courts } from "../../../models/Venues/Courts";

export default async function getVenuesCourts(socket, venue, cb) {
    if (!cb) return;
    const courts = await Courts.find({ venue });
    cb(courts);
}