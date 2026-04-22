import * as Bun from "bun";

export default class {
    constructor(private useCase: any, private cookieName: string, private handshakeQuery: string, private observableAdapter: any) { }

    hydrateSocketSession = async (socket: any, next: any) => {
        function joinSessionRoom(client: string | null, prevClient: string | null) {
            if (prevClient) socket.leave('client.' + prevClient);
            if (client) socket.join("client." + client);
        }

        function onDisconnect(x) {
            return socket.once('disconnect', x);
        }

        const _oa = this.observableAdapter;
        socket.session = _oa.createStore();

        const vtkn = socket.handshake.query?.[this.handshakeQuery] as string;
        const cookies = new Bun.CookieMap(socket.handshake.headers.cookie || "");
        const jwt = cookies.get(this.cookieName);

        socket.onSessionChange = (callback) => _oa.onSessionChange(socket.session, callback, onDisconnect);
        _oa.onClientChange(socket.session, joinSessionRoom, onDisconnect);

        try {
            await this.useCase.hydrateSocketSession({
                store: socket.session,
                vtkn,
                jwt,
                onSuccess: next,
                onError: (error) => {
                    console.error("Socket session error:", error);
                    next(error);
                },
                onDisconnect
            });
        } catch (error) {
            console.error("Socket session error:", error);
            next(error);
        }
    }
}