import moment from "moment"
import { Matches } from "../../../models/Venues/Matches"
import { Participations } from "../../../models/Venues/Matches/Participation"
import { Payments } from "../../../models/Venues/Payments"
import { stripe } from "../../../stripe"

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
        "slot": number,
        "daysFromNow": number,
        "pricePerPlayerPerHour": number,
        "priceTotal": number,
        "currency": string
    },
    "level": string,
    "venueId": any,
    "description": string,
    "private": boolean
}

export default async (socket, venue, match: MatchInput, nbTickets = 1, stripeSessionId?: string, cb) => {
    if (!cb) return;
    try {
        const stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
        if (!stripeSession) throw new Error('Stripe session not found');

        const formattedMatch: Match = {
            venue,
            court: match.selectedAvailability.court.id,
            level: match.level,
            start: match.selectedAvailability.start / 60,
            end: match.selectedAvailability.end / 60,
            date: moment().startOf('day').add(match.selectedAvailability.daysFromNow, 'days').format('YYYY-MM-DD'),
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

        const participations = await Participations.insertMany(
            Array.from({ length: nbTickets }, () => ({
                match: matchId,
                user: socket?.session?.currentUser?.get(),
                client: socket?.session?.client
            }))
        );
        const participationIds = participations.map(p => p._id);

        await Payments.insertOne({
            stripeId: stripeSession.payment_intent,
            participations: participationIds
        });
        
        cb({ ok: true });
    } catch (error) {
        console.error(error);
        cb({ ok: false });
    }
}

/*

{
    selectedAvailability: {
      court: [Object ...],
      start: 60,
      end: 180,
      slot: 2,
      daysFromNow: 1,
      pricePerPlayerPerHour: 10,
      priceTotal: 20,
      currency: "EUR",
    },
    level: "mixed",
  },

*/