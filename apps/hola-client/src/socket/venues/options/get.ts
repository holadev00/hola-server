import { Options } from "../../../models/Venues/Options";

export default async function getVenuesOptions(socket, venue, cb) {
    const options = await Options.find({ venue }).lean();
    cb(options);
}