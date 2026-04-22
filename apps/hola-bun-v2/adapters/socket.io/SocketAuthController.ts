import type { Socket } from 'socket.io';
import SocketController from './SocketController';
import type { RegisterPayloadEntity } from '../../domain/entities/auth/RegisterPayloadEntity';
import type { LoginPayloadEntity } from '../../domain/entities/auth/LoginPayloadEntity';
import type { AuthService } from '../../application/services/AuthService';

interface AuthCallback {
    success: boolean;
    data?: { logged: boolean; admin: boolean } | { token: string };
    error?: string;
}

export class SocketAuthController extends SocketController<AuthService> {
    override controller = (socket: Socket) => {
        socket.onAny((event, ...args) => console.log(event, ...args));
        socket.onAnyOutgoing((event, ...args) => console.log(event, ...args));

        const broadcastWhoAmI = ({ value: session }) => socket.emit('auth:whoami', session);
        socket.data.session.onChange(broadcastWhoAmI, { initial: true, immediate: true });

        socket.on('auth:login', this.login.bind(this, socket));
        socket.on('auth:social', this.social.bind(this, socket));
        socket.on('auth:register', this.register.bind(this, socket));
        socket.on('auth:logout', this.logout.bind(this, socket));
    };

    private social = async (socket: Socket, data: { provider: string; providerId: string }, cb: (res: AuthCallback) => void) => {
        try {
            const client = socket.data.session.client.get();

            if (!this.service) throw new Error('Use case not initialized');
            const res = await this.service.socialLogin(client, data);
            if (res?.error) throw new Error(res?.error);
            if (cb) cb({ success: true });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (cb) cb({ success: false, error: message });
        }
    };

    private login = async (socket: Socket, data: LoginPayloadEntity, cb: (res: AuthCallback) => void) => {
        try {
            const client = socket.data.session.client.get();

            if (!this.service) throw new Error('Use case not initialized');
            if (!data.identifier || !data.password) throw new Error('Invalid credentials');
            const res = await this.service.login(client, data);
            if (res?.error) throw new Error(res?.error);
            if (cb) cb({ success: true });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (cb) cb({ success: false, error: message });
        }
    };

    private register = async (
        socket: Socket,
        data: RegisterPayloadEntity,
        cb: (res: AuthCallback) => void
    ) => {
        try {
            const client = socket.data.session.client.get();

            if (!this.service) throw new Error('Use case not initialized');
            console.log(data);
            if (!data.displayname || !data.username || !data.email || !data.password) throw new Error('Invalid credentials');
            const res = await this.service.register(client, data);
            if (res?.error) throw new Error(res?.error);
            if (cb) cb({ success: true });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (cb) cb({ success: false, error: message });
        }
    };

    private logout = async (socket: Socket, cb: (res: AuthCallback) => void) => {
        try {
            const client = socket.data.session.client.get();
            const user = socket.data.session.user.get();

            if (!this.service) throw new Error('Use case not initialized');
            const res = await this.service.logout(client, user);
            if (res?.error) throw new Error(res?.error);
            if (cb) cb({ success: true });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            if (cb) cb({ success: false, error: message });
        }
    };
}
