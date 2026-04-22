export default class {
    private repositories: any;

    constructor({
        repositories
    }: {
        repositories: {
            users: any;
            sessions: any;
        };
    }) {
        this.repositories = repositories;
    }

    async signIn(client: string, identifier: string, password: string) {
        try {
            const user = await this.repositories.users.findByIdentifier(identifier);
            if (!user) throw new Error('User not found');
            if (user.password !== password) throw new Error('Incorrect password');
            await this.repositories.sessions.upsertSession({ client, user: user._id, active: true });
            return { success: true, data: user };
        } catch (error) {
            return { success: false, error };
        }
    }

    async socialSignIn({ client, username, email, provider, providerId }: any) {
        try {
            console.log({ client, username, email, provider, providerId });
            const user = await this.repositories.users.findByProviderId(provider, providerId);
            if (user) {
                await this.repositories.sessions.upsertSession({ client, user: user._id, active: true });
                return { success: true, data: user };
            }

            const newUserId = await this.repositories.users.createSocialUser({ username, email, provider, providerId });
            await this.repositories.sessions.upsertSession({ client, user: newUserId, active: true });
            return { success: true, data: newUserId };
        } catch (error) {
            return { success: false, error };
        }
    }

    async signOut({ client, user }: { client: string; user: string }) {
        try {
            console.log({ client, user });
            await this.repositories.sessions.upsertSession({ client, user, active: false });
            return { success: true };
        } catch (error) {
            return { success: false, error };
        }
    }
}