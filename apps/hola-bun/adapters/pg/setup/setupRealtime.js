import { createNotifyFunction } from "../realtime/notify.function.js";
import { createNotifyTrigger } from "../realtime/notify.trigger.js";

export async function setupRealtime(client, tables = []) {
    await createNotifyFunction(client);

    for (const table of tables) {
        await createNotifyTrigger(client, table);
    }
}