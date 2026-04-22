export default class {
    constructor(private repository: any, private jwtAdapter: any) { }

    async getOrCreateClient(token?: string) {
        if (!token) return this.repository.createClient();

        const payload = await this.jwtAdapter.decode(token);
        if (!payload) return this.repository.createClient();

        const existingClient = await this.repository.getClient(payload.client);
        return existingClient ? payload.client : this.repository.createClient();
    }

    async generateToken(client: string) {
        return this.jwtAdapter.sign({ client });
    }

    async decode(token: string) {
        return this.jwtAdapter.decode(token);
    }
}