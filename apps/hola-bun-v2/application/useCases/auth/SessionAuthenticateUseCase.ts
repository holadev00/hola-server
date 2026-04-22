import type { ClientRepositoryPort } from "../domain/ports/ClientRepositoryPort";
import type { SessionCacheAdapterPort } from "../domain/ports/SessionCacheAdapterPort";
import type { SessionTokenAdapterPort } from "../domain/ports/SessionTokenAdapterPort";

export class SessionAuthenticateUseCase {
    constructor(
        private jwtAdapter: SessionTokenAdapterPort,
        private cacheAdapter: SessionCacheAdapterPort,
        private clientRepository: ClientRepositoryPort
    ) { }

    async execute(visitorToken: string, token?: string) {
        try {
            const cached = await this.cacheAdapter.getSessionToken(visitorToken);
            const payload = await this.jwtAdapter.verify(cached || token);
            const existingClient = payload?.client ? await this.clientRepository.getClient(payload.client) : null;

            console.log("existingClient", existingClient);

            return existingClient;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}
