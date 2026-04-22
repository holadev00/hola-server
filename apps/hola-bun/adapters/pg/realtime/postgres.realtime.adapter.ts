import { createNotifyFunction } from "./notify.function";
import { createNotifyTrigger } from "./notify.trigger";
import { createTables } from "../setup/createTables";

export default class {
    constructor(sql) {
        this.sql = sql;
        this.listeners = [];
        this.listeningChannels = new Set();
    }

    async init({ tables = [] } = {}) {
        if (!this.sql.connected) await this.sql.connect();

        // tables
        await createTables(this.sql);

        // realtime
        await createNotifyFunction(this.sql);

        for (const table of tables) {
            await this._listenTable(table);
        }

        this._setupInternalListener();
    }

    async _listenTable(table) {
        if (this.listeningChannels.has(table)) return;

        await createNotifyTrigger(this.sql, table);
        await this.sql.query(`LISTEN ${table}`);

        this.listeningChannels.add(table);
    }

    _setupInternalListener() {
        this.sql.on("notification", (msg) => {
            try {
                const payload = JSON.parse(msg.payload);

                const event = {
                    ...payload,
                    channel: msg.channel,
                };

                this._dispatch(event);
            } catch (err) {
                console.error("❌ Event parse error:", err);
            }
        });
    }

    _dispatch(event) {
        for (const { filter, handler } of this.listeners) {
            try {
                if (this._match(filter, event)) {
                    handler(event);
                }
            } catch (err) {
                console.error("❌ Listener error:", err);
            }
        }
    }

    _match(filter, event) {
        if (!filter) return true;

        // string → table/channel
        if (typeof filter === "string") {
            return event.table === filter || event.channel === filter;
        }

        // function → custom filter
        if (typeof filter === "function") {
            return filter(event);
        }

        // object → matching partiel
        if (typeof filter === "object") {
            return Object.entries(filter).every(([key, value]) => {
                return event[key] === value;
            });
        }

        return false;
    }

    // 🟢 API publique
    on(filter, handler) {
        this.listeners.push({ filter, handler });
    }
}
