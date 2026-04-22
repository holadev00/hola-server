export default class {
    constructor(private redisAdapter: any) { }

    async getClient(client: string) {
        const [data] = await this.redisAdapter.getClientCache(client);
        return data;
    }

    async setClient(session: any) {
        await this.redisAdapter.setClientCache(session);
    }

    publish(session: any) {
        this.redisAdapter.publishEvent(session);
    }

    async getVisitor(vtkn: string) {
        const [data] = await this.redisAdapter.getVisitorCache(vtkn);
        return data;
    }

    async setVisitor(vtkn: string, token: string) {
        await this.redisAdapter.setVisitorCache(vtkn, token);
    }

    subscribe(cb: (event: any) => void) {
        this.redisAdapter.subscribeToEvents(cb);
    }
}