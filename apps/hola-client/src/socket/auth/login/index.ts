import { _validateForm } from "./_validateForm";
import { _checkUser } from "./_checkUser";
import { _checkPassword } from "./_checkPassword";
import { _bindUserToClient } from "./_bindUserToClient";
import type { Socket } from "socket.io";

export type LoginForm = { identifiant: string; password: string };

export const login = async (socket: Socket, form: LoginForm, cb: Function) => {
    try {
        const validatedData = await _validateForm(form);
        const user = await _checkUser(validatedData);
        await _checkPassword(user, validatedData);
        await _bindUserToClient(socket);
        cb({ success: true });
    } catch (err) {
        cb(err);
    }
};
