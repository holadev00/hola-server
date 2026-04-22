
export interface ClientRepositoryPort {
    createClient(): Promise<string>;
    getClient(client: string): Promise<{ id: string; } | null>;
}
