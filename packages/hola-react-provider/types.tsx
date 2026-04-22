import type { DashboardData, Reseevation, Court, Player } from "./types";

type Currency = "EUR" | "USD";

interface DayRevenue {
    day: string;
    amount: number;
    currency: Currency;
}

interface TodayReservations {
    courtName: string;
    start: string;
    private: boolean;
    confirmed: boolean;
}

export interface DashboardData {
    venueName: string;
    active: boolean;
    thisMonthRevenue: { amount: number; currency: Currency };
    lastMonthProgression: number;
    reservationsCount: number;
    occupancyRate: number;
    averageScore: number;
    thisWeekRevenue: DayRevenue[];
    todayReservations: TodayReservations[];
}

export type Reseevation = {
    id: string;
    courtName: string;
    date: string;
    start: string;
    end: string;
    private: boolean;
    confirmed: boolean;
}

export interface Court {
    id: string;
    name: string;
    status: "available" | "unavailable" | "busy";
    pricingPerHour: number;
    maxPlayeers: number;
    filmed: boolean;
    indoor: boolean;
}

export interface Player {
    name: string;
    matchesPlayed: number;
    badge: string;
    averageScore: number;
}

export interface ManagerContextStore {
    initialized: boolean;
    isManager: boolean;
    creation: Creation,
    dashboard: DashboardData | null;
    reservations: Reseevation[];
    courts: Court[];
    recentPlayers: {
        players: Player[];
        totalPlayersCount: number;
        thisMonthPlayersCount: number;
    };
    managerStatusRequested: boolean,
}

export interface Creation {
    enabled: boolean,
    nextEnabled: boolean,
    prevEnabled: boolean,
    settings: {
        venueName: string | null,
        venueAddress: string | null,
        venueStartTime: number,
        venueEndTime: number,
        courtName: string | null,
        courtSport: string | null,
        courtIndoor: boolean,
        courtFilmed: boolean,
        courtPricingAmount: number,
        courtPricingCurrency: Currency
    }
}