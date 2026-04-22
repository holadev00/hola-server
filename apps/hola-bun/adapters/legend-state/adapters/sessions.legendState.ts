import { observable } from "@legendapp/state";

export default class {
    lstnrOpt = { initial: true, immediate: true }

    constructor() { }

    getCurrentUser(sessions) {
        if (!sessions || sessions.length === 0) return null;
        const latest = sessions.reduce((max, u) => u?.timestamp > max?.timestamp ? u : max);
        const user = latest?.id?.toString() ?? null;

        return user;
    }

    createStore() {
        const $ = observable({
            client: null,
            users: [],
            current: () => ({
                user: this.getCurrentUser($?.users?.get())
            })
        });
        return $;
    }

    onSessionChange($, callback, unsubscribe) {
        const onChange = ({ value: session, getPrevious }: { value: Session }) => {
            const prev = getPrevious();

            callback(
                { ...session, current: session.current() },
                { ...prev, current: session.current() }
            );
        };

        const uns = $.onChange(onChange, this.lstnrOpt);
        unsubscribe(uns);
    }

    onClientChange($, callback, unsubscribe) {
        const onChange = ({ value, getPrevious }) => {
            const prev = getPrevious();
            callback(value, prev);
        }

        const uns = $.client.onChange(onChange, this.lstnrOpt);
        unsubscribe(uns);
    }

    setSession($, replace) {
        $.set(x => ({ ...x, ...replace }));
    }
}