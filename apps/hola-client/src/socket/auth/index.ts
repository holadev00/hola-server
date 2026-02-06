import { emitWhoAmI } from "./functions/emitWhoAmI";
import { login } from "./login";
import { logout } from "./logout";

export function bindAuth(s) {
    const cU = s.session?.currentUser;

    const _onUserChange = ({ value }) => emitWhoAmI(value, (_) => s.emit('AUTH/whoami', _));
    const _onUserRequest = (cb) => emitWhoAmI(cU.get(), cb);

    s.on('AUTH/whoami', _onUserRequest);
    const u = cU.onChange(_onUserChange, { initial: true, immediate: true });

    s.on(`AUTH/login`, login.bind(null, s));
    s.on(`AUTH/logout`, logout.bind(null, s));

    /*login(s, { identifiant: 'admin', password: 'admin' }, console.log);
    login(s, { identifiant: 'daouda', password: 'admin' }, console.log);
    login(s, { identifiant: 'test', password: 'admin' }, console.log);
    login(s, { identifiant: 'test', password: 'password' }, console.log);*/

    s.on('disconnect', () => {
        u!();
    });
}