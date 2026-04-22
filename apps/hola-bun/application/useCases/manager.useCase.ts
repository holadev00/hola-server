export default class {
    private repositories: any;
    private cache: any;
    private events: any;

    constructor({
        repositories,
        cache,
        events,
    }: {
        repositories: {
            users: any;
            manager: any;
        };
        cache: any;
        events: any,
    }) {
        this.repositories = repositories;
        this.cache = cache;
        this.events = events;

        this.repositories.users.listen(async ({ user, manager }: any) => {
            await this.cache.setManagerStatus(user, manager);
            await this.events.publishManagerStatus(user, manager);
        });
    }

    async getUserManagerStatus(id: string) {
        try {
            let data = await this.cache.getUserManagerStatus(id);
            data ??= await this.repositories.manager.getSubApp(id);

            return { success: true, data };
        } catch (error) {
            return { success: false, error };
        }
    }

    async subscribeManagerStatus(callback: any) {
        this.events.subscribeManagerStatus(callback);
    }

    async subscribeManagerStore(callback: any) {
        this.events.subscribeManagerStore(callback);
    }

    async getManagerDashboard(id: string) {
        try {
            return await this.repositories.manager.getManagerDashboard(id);
        } catch (error) {
            return { success: false, error };
        }
    }

    async getManagerReservations(id: string) {
        try {
            return await this.repositories.manager.getManagerReservations(id);
        } catch (error) {
            return { success: false, error };
        }
    }

    async getManagerCourts(id: string) {
        try {
            return await this.repositories.manager.getManagerCourts(id);
        } catch (error) {
            return { success: false, error };
        }
    }

    async getManagerRecentPlayers(id: string) {
        try {
            return await this.repositories.manager.getManagerRecentPlayers(id);
        } catch (error) {
            return { success: false, error };
        }
    }
}