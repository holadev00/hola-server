export interface DatabaseRealtimePort {
    init(config?: { tables?: string[] }): Promise<void>;
    on(filter: any, handler: (event: any) => void): void;
}