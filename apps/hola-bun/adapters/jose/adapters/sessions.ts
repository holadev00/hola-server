import { jwtVerify, SignJWT } from "jose";

export default class {
    secret = new TextEncoder().encode(process.env.JWT_SECRET_KENTO || "secret");

    constructor() { }

    async decode(token: string) {
        try {
            const { payload } = await jwtVerify(token, this.secret);
            return payload;
        } catch {
            return null;
        }
    }

    async sign(data: any) {
        return await new SignJWT(data)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d") // configurable
            .sign(this.secret);
    }
}
