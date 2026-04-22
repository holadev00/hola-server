export default class SocketRegistry {
    private namespaces = new Set<any>();

    registerNamespace(nsp: any) {
        this.namespaces.add(nsp);
    }

    async getSessions(client: string) {
        const results: any[] = [];

        for (const nsp of this.namespaces) {
            const sockets = await nsp.in("client." + client).fetchSockets();

            for (const socket of sockets) {
                if (socket.session) {
                    results.push(socket.session);
                }
            }
        }

        return results;
    }
}
