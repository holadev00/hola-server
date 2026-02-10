import { serve } from "bun";
import { injectSession } from "./src/session";
import type { InjectedSocket } from "./src/session/types";
import { io } from "./src/server/io";
import { server } from "./src/server";
import * as handlers from "./src/socket";
import mongoose from "mongoose";

if (!process?.env?.MONGO_DB_USER || !process?.env?.MONGO_DB_PASSWORD || !process?.env?.MONGO_DB_CLUSTER || !process?.env?.MONGO_DB_NAME) {
    throw new Error("MONGO_DB_USER, MONGO_DB_PASSWORD, MONGO_DB_CLUSTER and MONGO_DB_NAME must be defined");
}

const connectionString = (JSON.parse(process.env.MONGO_OFFLINE || "false")) ? process.env.MONGO_OFFLINE_URL : `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_DB_CLUSTER}/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;

if (connectionString) await mongoose.connect(connectionString);

serve(server);

try {
    io.use(injectSession).on("connection", (socket: InjectedSocket) => {
        socket.removeAllListeners();

        if (socket.rooms.size === 0) return socket.disconnect();

        //socket.onAny((event, ...args) => console.log("onAny", { event, args }));
        //socket.onAnyOutgoing((event, ...args) => console.log("onAnyOutgoing", { event, args }));

        handlers.auth.bind(socket);
        handlers.preferences.bind(socket);
        socket.on('geocode', handlers.locations.geocode.code.bind(null, socket));
        socket.on('LOCATIONS/geocode/reverse', handlers.locations.geocode.reverse.bind(null, socket));
        socket.on('USER/location/get', handlers.locations.users.get.bind(null, socket));
        socket.on('USER/location/set', handlers.locations.users.set.bind(null, socket));
        socket.on('VENUES/availability/get', handlers.venues.availability.default.bind(null, socket));
        socket.on('VENUES/matches/get', handlers.venues.matches.get.bind(null, socket));
        socket.on('VENUES/matches/set', handlers.venues.matches.set.bind(null, socket));
        socket.on('VENUES/match/details', handlers.venues.matches.details.bind(null, socket));
        socket.on('VENUES/courts/get', handlers.venues.courts.get.bind(null, socket));
        socket.on('VENUES/images/get', handlers.venues.images.get.bind(null, socket));
        socket.on('VENUES/options/get', handlers.venues.options.get.bind(null, socket));
        socket.on('VENUES/schedule/get', handlers.venues.schedules.get.bind(null, socket));
        socket.on('VENUES/favorite/get', handlers.venues.favorites.get.bind(null, socket));
        socket.on('VENUES/favorite/toggle', handlers.venues.favorites.toggle.bind(null, socket));
        socket.on('VENUES/map/get', handlers.venues.map.get.bind(null, socket));
        socket.on(`STRIPE/pbsh`, handlers.stripe.fetchPublishableKey.bind(null, socket));
        socket.on(`STRIPE/cs`, handlers.stripe.checkoutSession.bind(null, socket));
        socket.on(`PROFILE/get`, handlers.profile.get.bind(null, socket));
        socket.on(`FILES/get`, handlers.files.get.bind(null, socket));

        socket.on('disconnect', () => {
            console.log("disconnect");
            socket.disconnect();
            socket.removeAllListeners();
        });
    });
} catch (error) {
    console.log(error);
}

