import type { SessionTokenPayloadEnitity } from "../entities/SessionTokenPayloadEnitity";


export interface SessionTokenAdapterPort {
    sign(payload: SessionTokenPayloadEnitity): Promise<string>;
    verify(token: string): Promise<SessionTokenPayloadEnitity | null>;
}
