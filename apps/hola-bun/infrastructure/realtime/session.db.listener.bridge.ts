export default (pgAdapter: any, sessionUseCase: any) => {
    pgAdapter.on("sessions", async (event: any) => {
        const { type, new: newRow, old } = event;

        const baseRow = type === "DELETE" ? old : newRow;

        if (!baseRow) return; // sécurité

        await sessionUseCase.handleDatabaseEvent({
            client: baseRow.client_id,
            user: baseRow.user_id,
            timestamp: newRow?.updated_at ?? newRow?.created_at ?? Date.now(),
            active: type === "DELETE" ? false : baseRow.active
        });
    });
};