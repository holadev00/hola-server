import { serve } from "bun";
import { injectSession } from "./src/session";
import type { InjectedSocket } from "./src/session/types";
import { io } from "./src/server/io";
import { server } from "./src/server";
import "./mongoose";
import * as handlers from "./src/socket";
import { hash } from "./src/passwords";

serve(server);

try {
    io.use(injectSession).on("connection", (socket: InjectedSocket) => {
        socket.removeAllListeners();

        if (socket.rooms.size === 0) return socket.disconnect();

        //socket.onAny((event, ...args) => console.log("onAny", { event, args }));
        //socket.onAnyOutgoing((event, ...args) => console.log("onAnyOutgoing", { event, args }));

        handlers.auth.bindAuth(socket);
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

        /*socket.on('AUTH/check', (cb) => {
            try {
                if (!cb) return;
                cb(!!socket?.session?.users.get());
            } catch (error) {
                console.log(error);
            }
        });*/

        socket.on('disconnect', () => {
            console.log("disconnect");
            socket.disconnect();
            socket.removeAllListeners();
        });
    });
} catch (error) {
    console.log(error);
}