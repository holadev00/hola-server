import moment from "moment"
import { Matches } from "../../../models/Venues/Matches"
import { Participations } from "../../../models/Venues/Matches/Participation"

type MatchInput = {
    "selectedAvailability": {
        "court": {
            "id": any,
            "venueId": any,
            "name": string,
            "indoor": boolean,
            "filmed": boolean,
            "sport": string
        },
        "start": number,
        "end": number,
        "slot": number
    },
    "level": string,
    "venueId": any,
    "description": string,
    "private": boolean
}

export default async (socket, venue, match: MatchInput, cb) => {
    if (!cb) return;
    try {
        const formattedMatch: Match = {
            venue,
            court: match.selectedAvailability.court.id,
            level: match.level,
            start: match.selectedAvailability.start / 60,
            end: match.selectedAvailability.end / 60,
            date: moment().format('YYYY-MM-DD'),
            active: true,
            description: match.description,
            createdBy: {
                user: socket?.session?.currentUser?.get(),
                client: socket?.session?.client
            },
            private: match.private ?? false
        };

        const result = await Matches.insertOne(formattedMatch);

        const matchId = result._id;

        await Participations.insertOne({
            match: matchId,
            user: socket?.session?.currentUser?.get(),
            client: socket?.session?.client
        })
        cb({ ok: true });
    } catch (error) {
        console.error(error);
        cb({ ok: false });
    }
}