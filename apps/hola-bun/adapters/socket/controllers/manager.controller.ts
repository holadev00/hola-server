import type { Session } from "@/types";
import SocketController from "./socket.controller";
import { observable } from "@legendapp/state";

export default class extends SocketController {
    constructor({ useCase, middlewares, namespace }) {
        super({ useCase, middlewares, namespace });

        this.useCase.subscribeManagerStatus(async ({ user, manager }) => {
            const sockets = await this.nsp.in(`user:${user}`).fetchSockets();
            for (const socket of sockets) socket.updateSubApp();
        });

        this?.useCase?.subscribeManagerStore(async ({ user, change }) => {
            const sockets = await this.nsp.in(`user:${user}`).fetchSockets();
            for (const socket of sockets) socket.updateSubApp();
        });
    }

    override controller(socket) {
        socket.manager = observable(undefined);
        socket.updateSubApp = async () => {
            const user = socket.session.current().user;
            const res = await this.useCase.getUserManagerStatus(user);
            const data = !res.success ? { isManager: false } : res.data;
            socket.manager.set(data);
        }

        socket.onSessionChange(setupManagerStatusListener.bind(this, socket));

        const cb1 = handleManagerChange.bind(this, socket);
        const unsubscribe = socket.manager.onChange(cb1, { initial: true, immediate: true });
        socket.on('disconnect', unsubscribe);

        socket.onAny((event, ...args) => console.log("onAny - ", event, ...args));
        socket.onAnyOutgoing((event, ...args) => console.log("onAnyOutgoing - ", event, ...args));
    }
};

function handleManagerChange(this: any, socket: any, v: any) {
    const { value }: { value: boolean } = v;

    socket.on('manager:subApp:get', (cb) => cb(value));
    socket.emit('manager:subApp:get', value);
}

async function setupManagerStatusListener(this: any, socket: any, s: Session, sPrev: Session) {
    const { current: { user } } = s;
    const { current: { user: prevUser } } = sPrev;

    if (prevUser) socket.leave(`user:${prevUser}`);
    if (user) socket.join(`user:${user}`);

    await socket.updateSubApp();
}

/*async function updateSubApp(this: any, socket: any, user: string) {
    const isManager = socket.manager.isManager.get();

    async function dashboard() {
        const dflt = {
            venueId: null,
            venueName: "",
            active: false,
            thisMonthRevenue: 0,
            reservationsCount: 0,
            occupancyRate: 0,
            averageScore: 0,
            thisWeekRevenue: [],
            todayReservations: [],
        };

        if (!isManager) return dflt;
        const res = await this.useCase.getManagerDashboard(user)
        if (!res.success) return dflt;
        return res.data;
    }

    async function recentPlayers() {
        const dflt = {
            players: [],
            totalMonthPlayersCount: 0,
            totalPlayersCount: 0,
        }

        if (!isManager) return dflt;
        const res = await this.useCase.getManagerRecentPlayers(user)
        if (!res.success) return dflt;
        return res.data;
    }

    async function reservations() {
        const dflt = [];

        if (!isManager) return dflt;
        const res = await this.useCase.getManagerReservations(user)
        if (!res.success) return dflt;
        return res.data;
    }

    async function courts() {
        const dflt = [];

        if (!isManager) return dflt;
        const res = await this.useCase.getManagerCourts(user)
        if (!res.success) return dflt;
        return res.data;
    }

    socket.manager.set({
        isManager,
        dashboard: await dashboard.call(this),
        reservations: await reservations.call(this),
        courts: await courts.call(this),
        recentPlayers: await recentPlayers.call(this),
    });
}*/