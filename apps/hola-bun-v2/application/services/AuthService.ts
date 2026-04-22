import type { AuthServicePort } from "../../domain/ports/AuthServicePort";
import type AuthLoginUseCase from "../useCases/auth/AuthLoginUseCase";
import type AuthLogoutUseCase from "../useCases/auth/AuthLogoutUseCase";
import type AuthRegisterUseCase from "../useCases/auth/AuthRegisterUseCase";
import type { AuthSocialLoginUseCase } from "../useCases/auth/AuthSocialLoginUseCase";
import type SessionAuthenticateUseCase from "../useCases/auth/SessionAuthenticateUseCase";
import type SessionHydrateUseCase from "../useCases/auth/SessionHydrateUseCase";
import type SessionSyncUseCase from "../useCases/auth/SessionSyncUseCase";

export class AuthService implements AuthServicePort {
    constructor(
        private hydrateUseCase: SessionHydrateUseCase,
        private authenticateUseCase: SessionAuthenticateUseCase,
        private syncUseCase: SessionSyncUseCase,
        private loginUseCase: AuthLoginUseCase,
        private registerUseCase: AuthRegisterUseCase,
        private logoutUseCase: AuthLogoutUseCase,
        private socialLoginUseCase: AuthSocialLoginUseCase
    ) { }

    hydrateSession = async (visitorToken: string, token?: string) => {
        return await this.hydrateUseCase.execute(visitorToken, token);
    };

    authenticateToken = async (visitorToken: string, token?: string) => {
        return await this.authenticateUseCase.execute(visitorToken, token);
    };

    syncSessions = async (client: string, onChange: (payload: any) => void) => {
        return await this.syncUseCase.execute(client, onChange);
    };

    logout = async (client: string, user: string) => {
        return await this.logoutUseCase.execute({ client, user });
    };

    login = async (client: string, payload: { identifier: string; password: string; }) => {
        return await this.loginUseCase.execute({ client, ...payload });
    };

    register = async (client: string, payload: { displayname: string; username: string; email: string; password: string; password_confirmation: string; avatar?: string; }) => {
        return await this.registerUseCase.execute({ client, ...payload });
    };

    socialLogin = async (client: string, payload: { provider: string; providerId: string; }) => {
        return await this.socialLoginUseCase.execute({ client, ...payload });
    };
}
