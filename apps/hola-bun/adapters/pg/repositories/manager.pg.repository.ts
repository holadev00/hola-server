export default class {
    constructor(private connection: any) {
    }

    async getSubApp(user) {
        let isManagerReq = await this.connection.query("SELECT * FROM users WHERE id = $1", [user]);
        let isManager = isManagerReq.rows?.[0]?.manager;

        return { isManager };
    }
}