import { BcryptPasswordAdapter } from "./adapters/bcrypt/BcryptPasswordAdapter";
import { JoiAuthValidation } from "./adapters/joi/JoiAuthValidation";
import { JoseSessionAdapter } from "./adapters/jose/JoseSessionAdapter";
import { PostgresSessionRepository } from "./adapters/postgres/PostgresSessionRepository";
import { RedisSessionAdapter } from "./adapters/redis/RedisSessionAdapter";
import { SequelizeClient } from "./adapters/sequelize/SequelizeClient";
import { SequelizeClientRepository } from "./adapters/sequelize/SequelizeClientRepository";
import { SequelizeUsersRepository } from "./adapters/sequelize/SequelizeUsersRepository";

import { AuthLoginUseCase } from "./application/useCases/auth/AuthLoginUseCase";
import { AuthLogoutUseCase } from "./application/useCases/auth/AuthLogoutUseCase";
import { AuthRegisterUseCase } from "./application/useCases/auth/AuthRegisterUseCase";
import { SessionAuthenticateUseCase } from "./application/useCases/auth/SessionAuthenticateUseCase";
import { SessionHydrateUseCase } from "./application/useCases/auth/SessionHydrateUseCase";
import { SessionSyncUseCase } from "./application/useCases/auth/SessionSyncUseCase";
import { AuthService } from "./application/services/AuthService";

import { createServer } from "./bootstrap/server";
import { SocketAuthMiddlewares } from "./adapters/socket.io/SocketAuthMiddlewares";
import { SocketAuthController } from "./adapters/socket.io/SocketAuthController";
import { PostgresClient } from "./adapters/postgres/PostgresClient";
import { redisClient } from "./adapters/redis/RedisClients";
import { SequelizeFilesRepository } from "./adapters/sequelize/SequelizeFilesRepository";
import { AuthSocialLoginUseCase } from "./application/useCases/auth/AuthSocialLoginUseCase";

console.log("Hello via Bun!");

const sequelizeClient = new SequelizeClient({
    host: process.env.HOLA_POSTGRES_HOST ?? '',
    port: process.env.HOLA_POSTGRES_PORT ?? 5432,
    database: process.env.HOLA_POSTGRES_DB ?? '',
    username: process.env.HOLA_POSTGRES_USER ?? '',
    password: process.env.HOLA_POSTGRES_PASSWORD ?? '',
    dialect: 'postgres'
})

const postgresClient = new PostgresClient({
    host: process.env.HOLA_POSTGRES_HOST,
    port: process.env.HOLA_POSTGRES_PORT,
    user: process.env.HOLA_POSTGRES_USER,
    password: process.env.HOLA_POSTGRES_PASSWORD,
    database: process.env.HOLA_POSTGRES_DB
})

const filesRepository = new SequelizeFilesRepository(sequelizeClient);
const clientRepository = new SequelizeClientRepository(sequelizeClient);
const sessionRepository = new PostgresSessionRepository(postgresClient);
const usersRepository = new SequelizeUsersRepository(sequelizeClient);

const sessionCacheAdapter = new RedisSessionAdapter(redisClient);
const sessionJwtAdapter = new JoseSessionAdapter(process.env.SESSION_JWT_SECRET!);
const authValidationAdapter = new JoiAuthValidation();
const authPasswordAdapter = new BcryptPasswordAdapter(10);

const authService = new AuthService(
    new SessionHydrateUseCase(sessionJwtAdapter, sessionCacheAdapter, clientRepository),
    new SessionAuthenticateUseCase(sessionJwtAdapter, sessionCacheAdapter, clientRepository),
    new SessionSyncUseCase(sessionRepository),
    new AuthLoginUseCase(authPasswordAdapter, authValidationAdapter, usersRepository, sessionRepository),
    new AuthRegisterUseCase(authPasswordAdapter, authValidationAdapter, usersRepository, sessionRepository),
    new AuthLogoutUseCase(sessionRepository),
    new AuthSocialLoginUseCase(authPasswordAdapter, authValidationAdapter, usersRepository, sessionRepository)
);

const { io } = createServer(authService);

const { authenticateMw, enforceAuthMw } = new SocketAuthMiddlewares(authService);
const authController = new SocketAuthController(io, '/auth', authService, [authenticateMw]);