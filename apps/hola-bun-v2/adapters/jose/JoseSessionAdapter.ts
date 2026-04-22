import { SignJWT, jwtVerify } from "jose";
import type { SessionTokenPayloadEnitity } from "@amine-chat/auth-domain/domain/entities/auth/SessionTokenPayloadEnitity";
import type { SessionTokenAdapterPort } from "@amine-chat/auth-domain/domain/ports/auth/SessionTokenAdapterPort";

export class JoseSessionAdapter implements SessionTokenAdapterPort {
    private readonly secret: Uint8Array;
    constructor(secret: string) {
        this.secret = new TextEncoder().encode(secret || 'secret');
    }

    async sign(payload: SessionTokenPayloadEnitity): Promise<string> {
        return await new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("2h")
            .sign(this.secret);
    }

    async verify(token: string): Promise<SessionTokenPayloadEnitity | null> {
        try {
            const { payload } = await jwtVerify(token, this.secret);
            return payload as SessionTokenPayloadEnitity;
        } catch {
            return null;
        }
    }
}
