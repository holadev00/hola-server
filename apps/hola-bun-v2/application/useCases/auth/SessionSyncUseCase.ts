import EventEmitter from "eventemitter3";
import type { SessionRepositoryPort } from "../domain/ports/SessionRepositoryPort";

export class SessionSyncUseCase {
    private eventEmitter = new EventEmitter();

    constructor(
        private sessionRepository: SessionRepositoryPort
    ) {
        sessionRepository.listen((payload) => {
            this.eventEmitter.emit(payload.client, payload);
        });
    }

    async execute(client: string, onChange: (payload: any) => void) {
        try {
            const sessions = await this.sessionRepository.getSessions(client);

            onChange?.(sessions);
            this.eventEmitter.on(client, onChange);
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}
