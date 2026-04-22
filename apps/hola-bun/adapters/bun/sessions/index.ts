import * as Bun from "bun";

export default class {
    constructor(private useCase: any, private cookieName: string, private paramName: string) { }

    hydrateClientSession = async (req: Bun.BunRequest<"/socket.io/">) => {
        let token: string | null = req.cookies.get(this.cookieName);
        const url: URL = new URL(req.url);
        const vtkn: string | null = url.searchParams.get(this.paramName);

        const save: any = t => req.cookies.set(this.cookieName, t, { httpOnly: true, secure: true });
        await this.useCase.hydrateClientSession({ token, vtkn, save });
    }
}
