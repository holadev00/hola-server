import type { SessionPayloadEnitity } from "../entities/SessionPayloadEnitity";

export interface SessionRepositoryPort {
    listen(callback: (payload: SessionPayloadEnitity) => void): Promise<void>;
    getSessions(client: string): Promise<SessionPayloadEnitity>;
    addSession(client: string, user: string): Promise<void>;
    removeSession(client: string, user: string): Promise<void>;
}
