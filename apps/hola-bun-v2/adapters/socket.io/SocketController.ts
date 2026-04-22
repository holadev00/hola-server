export default class SocketController<T> {
  service: T;
  middlewares: any[];

  constructor(
    io: any,
    private path: string = '/',
    service: T,
    middlewares?: any
  ) {
    this.service = service;
    this.middlewares = middlewares;

    const nsp = io.of(this.path);

    for (const mw of this?.middlewares ?? []) nsp.use(mw);
    nsp.on('connection', (socket) => this.controller(socket));

    this.bind(nsp);
  }

  controller = (socket: any) => { };

  bind = (io: any) => { }
}
