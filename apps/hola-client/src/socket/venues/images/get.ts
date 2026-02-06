import { Images } from "../../../models/Venues/Images";

export default async function getVenuesImages(socket, venue, cb) {
    if(!cb) return;
    const images = await Images.find({ venue }).lean();
    cb(images);
}