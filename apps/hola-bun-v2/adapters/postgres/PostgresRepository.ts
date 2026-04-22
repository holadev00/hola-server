
export class PostgresRepository {
    constructor(public db: any) {
        this.init().then(console.log).catch(console.error);
    }

    async init() {
    }
}
