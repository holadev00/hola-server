import type { Socket } from "socket.io";
import SocketController from "./SocketController";
import type { any } from "joi";

export default class SocketSearchController extends SocketController<any> {
    override controller = (socket: Socket) => {
        socket.on('search:results', this.results.bind(this, socket));
        socket.on('search:history', this.history.bind(this, socket));
        socket.on('search:interaction', this.interaction.bind(this, socket));
    };

    private results = async (socket: Socket, query: string, cb: (res: any) => void) => {
        const results = await this.service.getSearchResults(socket.data.session.user.get(), query);
        if (cb) cb({ success: true, data: results });
    }

    private history = async () => { }
    private interaction = async () => { }
}