import { observable } from "@legendapp/state";
import { UserLocation } from "../types/UserLocation";

export default observable<UserLocation>({
    latitude: undefined,
    longitude: undefined,
    address: undefined
})