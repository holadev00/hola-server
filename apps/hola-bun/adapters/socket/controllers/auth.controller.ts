import SocketController from "./socket.controller";

export default class extends SocketController {
    override controller = (socket) => {
        socket.onSessionChange(function ({ current: { user } }) {
            socket.on('auth:isLoggedIn', (cb) => cb(!!user));
            socket.emit('auth:isLoggedIn', !!user);
        }.bind(this));

        socket.on("socialSignIn", ({ username, email, provider, providerId, avatar }: any) => {
            const client = socket.session.client.get();
            this.useCase.socialSignIn({ client, username, email, provider, providerId, avatar });
        });

        socket.on("signOut", () => {
            const client = socket.session.client.get();
            const user = socket.session.current().user;

            this.useCase.signOut({ client, user });
        });

        socket.onAny((event, ...args) => console.log(event, ...args));
        socket.onAnyOutgoing((event, ...args) => console.log(event, ...args));
    }
}