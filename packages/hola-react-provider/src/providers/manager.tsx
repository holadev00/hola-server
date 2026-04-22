import { Computed, useObservable, useObserve } from "@legendapp/state/react";
import { createContext, useContext, useEffect } from "react";
import { manager } from "../socket";
import type { Court, ManagerContextStore, Player, Reseevation } from "../../types";

const socket = manager.socket("/manager");

export const managerContext = createContext<any>({
    isManager: false,
    creation: {
        enabled: false,
        settings: {}
    },
    dashboard: null,
    reservations: [],
    recentPlayers: {
        players: [],
        totalPlayersCount: 0,
        thisMonthPlayersCount: 0,
    },
    getDashboard: () => { },
    getReservations: () => { },
    requestBecomeManager: () => { },
    getCourts: () => { },
    getRecentPlayers: () => { },
    setVenueName: (name: string) => { },
    setLocation: (location: string) => { },
    setGallery: (gallery: string[]) => { },
    setBankDetails: (bankDetails: { accountNumber: string; routingNumber: string; }) => { },
    setCancelationPolicy: (policy: string) => { },
    setAutomaticBankTransfers: (enabled: boolean) => { },
    setNotifications: ({ newReservation, cancellations, weeklyReport }: { newReservation: boolean; cancellations: boolean; weeklyReport: boolean; }) => { },
    addCourt: () => { },
    managerStatusRequested: false,
})

export const useManager = () => {
    return useContext(managerContext);
}

export const ManagerProvider = function ({ children }: { children: React.ReactNode }) {
    const store = useObservable<ManagerContextStore>({
        initialized: false,
        isManager: false,
        creation: {
            enabled: false,
            nextEnabled: false,
            prevEnabled: false,
            settings: {
                venueName: null,
                venueAddress: null,
                venueStartTime: 0,
                venueEndTime: 0,
                courtName: null,
                courtSport: null,
                courtIndoor: true,
                courtFilmed: true,
                courtPricingAmount: 0,
                courtPricingCurrency: "EUR"
            }
        },
        dashboard: {
            venueId: null,
            venueName: "",
            active: false,
            thisMonthRevenue: 0,
            reservationsCount: 0,
            occupancyRate: 0,
            averageScore: 0,
            thisWeekRevenue: [
                { day: "Monday", revenue: 0, },
                { day: "Tuesday", revenue: 0, },
                { day: "Wednesday", revenue: 0, },
                { day: "Thursday", revenue: 0, },
                { day: "Friday", revenue: 0, },
                { day: "Saturday", revenue: 0, },
                { day: "Sunday", revenue: 0, },
            ],
            todayReservations: [] as [],
        } as any,
        reservations: [] as Reseevation[],
        courts: [] as Court[],
        recentPlayers: {
            players: [] as Player[],
            totalPlayersCount: 0,
            thisMonthPlayersCount: 0,
        },
        managerStatusRequested: false
    });

    useEffect(() => {
        store.onChange(({ value: s }) => {
            console.log("Manager status changed: ", s);
        }, { initial: true });

        const cb = (subApp: any) => {
            if (!subApp) return;
            const { isManager, dashboard, reservations, courts, recentPlayers } = subApp;

            store.set(x => ({
                ...x,
                initialized: true,
                isManager,
                dashboard,
                reservations,
                courts,
                recentPlayers
            }))
        };

        socket.emit('manager:subApp:get', cb);
        socket.on(`manager:subApp:get`, cb);
    }, []);

    return (
        <Computed>
            {() => store.initialized.get() && <managerContext.Provider value={{
                isManager: store.isManager.get(),
                haveVenue: !!store.dashboard.get()?.venueId,
                creation: store.creation.get(),
                dashboard: store.dashboard.get(),
                reservations: store.reservations.get(),
                recentPlayers: store.recentPlayers.get(),
                managerStatusRequested: store.managerStatusRequested.get(),
                requestBecomeManager: () => socket.emit('manager:request'),
                activeCreating: () => store.creation.enabled.set(true),
                stopCreating: () => store.creation.enabled.set(false),
                setCreationSetting: (obj: { [key: string]: string | number | boolean }) => store.creation.settings.set(x => ({ ...x, ...obj })),
                enableCreationNext: () => store.creation.nextEnabled.set(true),
                disableCreationNext: () => store.creation.nextEnabled.set(false),
                enableCreationPrev: () => store.creation.prevEnabled.set(true),
                disableCreationPrev: () => store.creation.prevEnabled.set(false),
                createVenue: () => socket.emit('manager:business:create', store.creation.settings.get()),
                getDashboard: () => socket.emit('manager:dashboard:get', store.dashboard.set),
                getReservations: () => socket.emit('manager:reservations:get', store.dashboard.set),
                getCourts: () => socket.emit('manager:courts:get', store.dashboard.set),
                getRecentPlayers: () => socket.emit('manager:recentPlayers:get', store.dashboard.set),
                setVenueName: (name: string) => socket.emit('manager:venue:set', { name }),
                setLocation: (location: string) => socket.emit('manager:venue:set', { location }),
                setGallery: (gallery: string[]) => { },
                setBankDetails: (bankDetails: { accountNumber: string; routingNumber: string; }) => { },
                setCancelationPolicy: (policy: string) => { },
                setAutomaticBankTransfers: (enabled: boolean) => { },
                setNotifications: ({ newReservation, cancellations, weeklyReport }: { newReservation: boolean; cancellations: boolean; weeklyReport: boolean; }) => { },
                addCourt: () => { }
            }}>
                {children}
            </managerContext.Provider>}
        </Computed>
    )
}

