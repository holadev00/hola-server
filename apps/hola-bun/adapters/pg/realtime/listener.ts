export function setupPgListener(client, onEvent) {
    client.on("notification", (msg) => {
        const payload = JSON.parse(msg.payload);
        onEvent(payload, msg.channel);
    });
}