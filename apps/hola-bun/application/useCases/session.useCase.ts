import type { sessionHydratorService, sessionRealtimeService } from "../services";

export default class {
    constructor(
        private realtime: sessionRealtimeService,
        private hydrator: sessionHydratorService
    ) { }

    handleDatabaseEvent = (event: any) => {
        return this.realtime.handleDatabaseEvent(event);
    }

    hydrateClientSession = ({ token, vtkn, save }) => {
        return this.hydrator.hydrateHttp(token, vtkn, save);
    }

    hydrateSocketSession = ({ store, vtkn, jwt, onSuccess, onError, onDisconnect }) => {
        return this.hydrator.hydrateSocket(store, vtkn, jwt, onSuccess, onError, onDisconnect);
    }

    syncSessions = async (client: string, users: any[], getSessionsFromClient: any) => {
        const sessions = await getSessionsFromClient(client);

        for (const session of sessions) {
            this.hydrator.hydrateSocketUsers(session, users);
        }
    }
}