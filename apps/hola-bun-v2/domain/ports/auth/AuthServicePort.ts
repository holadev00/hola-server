export interface AuthServicePort {
    hydrateSession(visitorToken: string, token: string | undefined): Promise<string | null>;
}