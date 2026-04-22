import type { Socket } from "socket.io";
import SocketController from "./SocketController";
import type { ChatService } from "../../services/ChatService";
import type { ChatActivityType } from "../../domain/entities/chat/ChatActivityType";

export default class SocketChatController extends SocketController<ChatService> {
    constructor(io: any, path: string, service: ChatService, middlewares: any[]) {
        super(io, path, service, middlewares);

        this.service.watchChatList((payload) => {
            for (const item of payload) {
                const members = item.members.map((m: any) => m.userId);
                for (const member of members) {
                    io.to(member).emit('chat:list:change', item);
                }
            }
        })
    }

    override controller = (socket: Socket) => {
        socket.on('chat:list:get', this.getChatList.bind(this, socket));
        socket.on('chat:channel:create', this.createChannel.bind(this, socket));
        socket.on('chat:channel:invite', this.inviteInChannel.bind(this, socket));
        socket.on('chat:activity', this.upsertActivity.bind(this, socket));
        socket.on('chat:message', this.upsertMessage.bind(this, socket));
    };

    private getChatList = async (socket: Socket, cb: any) => {
        try {
            const { id: userId } = socket.data.session.user.get();
            const res = await this.service.getChatListItems({ userId });
            if (cb) cb({ success: true, data: res });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (cb) cb({ success: false, error: message })
        }
    }

    private createChannel = async (socket: Socket, name: string, guests: string[], cb: any) => {
        try {
            const { id: user } = socket.data.session.user.get();
            const res = await this.service.createChatChannel({ user, name, guests });

            if (res?.error) throw new Error(res?.error);
            if (cb) cb({ success: true, data: res.data });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (cb) cb({ success: false, error: message })
        }
    }

    private inviteInChannel = async (socket: Socket, payload: InvitationPayload, cb: any) => {
        try {
            const user = socket.data.session.user.get();
            const res = await this.service.inviteToChat({
                //user: user.id,
                channelId: payload.channel,
                guestId: payload.guest
            });

            if (res?.error) throw new Error(res?.error);
            if (cb) cb({ success: true });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (cb) cb({ success: false, error: message })
        }
    }

    private upsertActivity = async (socket: Socket, payload: ActivityPayload, cb) => {
        try {
            const user = socket.data.session.user.get();
            const res = await this.service.setChatActivity({
                senderId: user.id,
                channelId: payload.channel,
                type: payload.type
            });

            if (res?.error) throw new Error(res?.error);
            if (cb) cb({ success: true });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (cb) cb({ success: false, error: message })
        }
    }

    private upsertMessage = async (socket: Socket, payload: MessagePayload, cb) => {
        try {
            const user = socket.data.session.user.get();
            const res = await this.service.sendChatMessage({
                senderId: user.id,
                channelId: payload.channel,
                content: payload.content,
                parentId: payload.parent
            });

            if (res?.error) throw new Error(res?.error);
            if (cb) cb({ success: true });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (cb) cb({ success: false, error: message })
        }
    }
}

interface ActivityPayload {
    channel: string,
    type: ChatActivityType
}

interface MessagePayload {
    channel: string,
    content: { type: string; value: any; }[],
    parent?: string,
    id?: string,
}

interface InvitationPayload {
    channel: string,
    guest: string
}