import { observable } from "@legendapp/state";
import { Computed, use$, useObserveEffect } from "@legendapp/state/react";
import { createContext, useContext, useEffect } from "react";
import { currentDay } from "../screens/create/state";
import { useSocket } from "@hola/socket";
import { useRoute } from "@react-navigation/native";
import { createSocketGetter } from "@hola/socket/functions/createSocketGetter";

type VenueScreenCtxtType = {
    getVenueMatches: () => void;
    getAvailabilities: (daysFromNow: number) => void;
    venueID: string;
    matches: Match[];
    availabilities: AvailabilityByDay | undefined;
    creationInput: any;
    settings: any;
    daysFromNow: number;
    setMatch: () => Promise<void>;
};

export const VenueScreenContext = createContext<VenueScreenCtxtType | null>(null);

export function useVenue(): VenueScreenCtxtType {
    if (!VenueScreenContext) {
        throw new Error("useVenueID must be used within a VenueScreenProvider");
    }
    return useContext(VenueScreenContext);
}

type Match = {
    id: number;
    sport: string;
    level: string;
    indoor: boolean;
    filmed: boolean;
    start: string;
    end: string;
}

type Availability = {
    field: {
        id: number;
        name: string;
        sport: string;
        indoor: boolean;
        filmed: boolean;
    };
    start: string;
    end: string;
};

type AvailabilityByDay = {
    [daysFromNow: string]: Availability[]
}

const venues = observable<{
    [key: string]: {
        matches: Match[];
        availabilities?: AvailabilityByDay;
        creationInput: {
            selectedAvailability: Availability | null;
            description: string;
            sport: string;
            level: string;
            public: boolean;
        };
        settings: any;
    }
}>({});

export function withVenueScreenProvider(Component: any) {
    return function (props: any) {
        return <VenueScreenProvider><Component {...props} /></VenueScreenProvider>;
    };
}


export function VenueScreenProvider({ children }: any) {
    const { params } = useRoute();
    const venueID = params?.venue;
    const socket = useSocket("/");

    useObserveEffect(function () {
        const off = getAvailabilities(
            currentDay.get(),
            venues[venueID].settings.get()
        );
        return off;
    }, [currentDay, venues[venueID].settings]);

    function getVenueMatches() {
        return createSocketGetter({
            socket,
            event: 'VENUES/matches/get',
            args: [venueID],
            setter: venues[venueID].matches.set,
        });
    }

    function getAvailabilities(daysFromNow: number, settings?: any) {
        return createSocketGetter({
            socket,
            event: 'VENUES/availability/get',
            args: [venueID, daysFromNow, settings],
            setter: venues[venueID].availabilities?.[daysFromNow].set,
        });
    }

    async function setMatch(nb_tickets?: number, stripeSessionId?: string) {
        return await socket.emitWithAck('VENUES/matches/set', venueID, venues[venueID].creationInput.get(), nb_tickets, stripeSessionId);
    }

    useEffect(function () {
        const off = getAvailabilities(currentDay.get());
        return off;
    }, [params]);

    return <Computed>
        {() => {
            return <>
                <VenueScreenContext.Provider value={{
                    venueID,
                    getVenueMatches,
                    getAvailabilities,
                    matches: venues[venueID].matches.get(),
                    availabilities: venues[venueID].availabilities.get(),
                    creationInput: venues[venueID].creationInput,
                    settings: venues[venueID].settings,
                    daysFromNow: currentDay.get(),
                    setMatch
                }}>
                    {children}
                </VenueScreenContext.Provider>
            </>
        }}
    </Computed>;
}