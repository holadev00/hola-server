import { emitWhoAmI } from "./functions/emitWhoAmI";
import { login } from "./login";
import { logout } from "./logout";
import * as signup from "./signup";

export function bind(s) {
    const cU = s.session?.currentUser;

    const _onUserChange = ({ value }) => emitWhoAmI(value, (_) => s.emit('AUTH/whoami', _));
    const _onUserRequest = (cb) => emitWhoAmI(cU.get(), cb);

    s.on('AUTH/whoami', _onUserRequest);
    const u = cU.onChange(_onUserChange, { initial: true, immediate: true });

    s.on(`AUTH/login`, login.bind(null, s));
    s.on(`AUTH/signup/validate`, signup.validate.bind(null, s));
    s.on(`AUTH/signup/register`, signup.register.bind(null, s));
    s.on(`AUTH/signup/onBoardingEnd`, signup.onBoardingEnd.bind(null, s));
    s.on(`AUTH/logout`, logout.bind(null, s));

    s.on('disconnect', () => {
        u!();
    });
}