import { Manager } from "socket.io-client";
import uuid from "react-native-uuid";

export const manager = new Manager("http://localhost", {
    transports: ["websocket"],
    withCredentials: true,
    secure: true,
    query: { HOLAVTKN: uuid.v4() }
});

//manager.socket("/manager");
manager.socket("/").on('auth:isLoggedIn', (data) => console.log(data));