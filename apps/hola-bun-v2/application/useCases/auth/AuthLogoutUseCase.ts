import type { SessionRepositoryPort } from "../domain/ports/SessionRepositoryPort";

export class AuthLogoutUseCase {
    constructor(
        private sessionRepository: SessionRepositoryPort
    ) { }

    execute({ client, user }: { client: string; user: string }) {
        this.sessionRepository.removeSession(client, user);
    }
}