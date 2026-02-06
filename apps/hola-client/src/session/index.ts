import { createLogger } from "../logger";
import { Clients, Sessions } from "../models";
import create from "./service";
import mongoose from "mongoose";

export const { attachSession, injectSession, signClientIdJWT, validateClientIdJWT } = create({
    createLogger,
    clientIdCookieName: (process?.env?.CLIENT_ID_COOKIE_NAME)!,
    jwtSecret: (process?.env?.JWT_SECRET)!,
    createAndReturnClientID: async (visitorId) => (await Clients.create({ visitorId }))?._id?.toString() as string,
    findClient: async ({ clientId, visitorId }) => (await Clients.findOne({ $or: [{ _id: new mongoose.Types.ObjectId(clientId) }, { visitorId }] }))?._id?.toString() as string,
    getSessions: async (client) => await Sessions.find({ client: new mongoose.Types.ObjectId(client), active: true })
});