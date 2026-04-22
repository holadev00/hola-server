import SocketController from "./socket.controller";

export default class extends SocketController {
    override controller(socket) {
        socket.emit("health", 200);

        socket.on("disconnect", () => {
            console.log("disconnected from health");
        });
    }
}