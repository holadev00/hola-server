
export interface SessionCacheAdapterPort {
    getSessionToken(visitorToken: string): Promise<string | null>;
    setSessionToken(visitorToken: string, token: string): Promise<void>;
}
