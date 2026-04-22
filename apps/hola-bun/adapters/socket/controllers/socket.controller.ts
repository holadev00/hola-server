export default class {
    private io: any;
    private nsp: any;
    private namespace: string;
    private middlewares: any;
    private useCase?: any;

    constructor({ namespace, middlewares, useCase }: any) {
        this.namespace = namespace;
        this.middlewares = middlewares;
        this.useCase = useCase;
    }

    controller(socket) { }

    bind(io: any) {
        try {
            console.log("binding", this.namespace);
            this.io = io;
            this.nsp = io.of(this.namespace);
            if (this.middlewares) for (const mw of this.middlewares) this.nsp.use(mw);
            this.nsp.on("connection", this.controller.bind(this));
        } catch (error) {
            console.error(error);
        }
    }

    attach(fn: any) {
        console.log("attach", this.namespace);
        fn(this.nsp);
    }
}
