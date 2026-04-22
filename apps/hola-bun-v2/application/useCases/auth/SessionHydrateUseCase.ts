import type { ClientRepositoryPort } from "../domain/ports/ClientRepositoryPort";
import type { SessionCacheAdapterPort } from "../domain/ports/SessionCacheAdapterPort";
import type { SessionTokenAdapterPort } from "../domain/ports/SessionTokenAdapterPort";

export class SessionHydrateUseCase {
    constructor(
        private jwtAdapter: SessionTokenAdapterPort,
        private cacheAdapter: SessionCacheAdapterPort,
        private clientRepository: ClientRepositoryPort
    ) { }

    async execute(visitorToken: string, token?: string) {
        try {
            let client;
            const payload = token ? await this.jwtAdapter.verify(token) : null;
            const existingClient = payload?.client ? await this.clientRepository.getClient(payload.client) : null;
            client = existingClient ? payload?.client : await this.clientRepository.createClient();

            const newToken = await this.jwtAdapter.sign({ client });
            await this.cacheAdapter?.setSessionToken(visitorToken, newToken);
            return newToken;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}
