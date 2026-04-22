import * as adapters from "@/adapters"
import * as application from "@/application"
import * as infrastructure from "@/infrastructure"

const cookieName = process.env.CLIENT_ID_COOKIE_NAME;
const paramName = process.env.VISITOR_TOKEN_PARAM_NAME;
if (!cookieName) throw new Error("CLIENT_ID_COOKIE_NAME is not defined");
if (!paramName) throw new Error("VISITOR_TOKEN_PARAM_NAME is not defined");

const sql = adapters.pg.clients.sql;
const pgAdapter = new adapters.pg.realtime.adapter(sql);
await pgAdapter.init({ tables: ["sessions"], });

const sessionsJwt = new adapters.jose.adapters.sessions()
const sessionsRepository = new adapters.pg.repositories.sessions(sql)
const sessionsSocketObsAdapter = new adapters.legendState.adapters.sessions();
const sessionsRedisAdapter = new adapters.redis.adapters.sessions(
    adapters.redis.connections.client,
    adapters.redis.connections.publisher,
    adapters.redis.connections.subscriber
);

const authService = new application.services.sessionAuthService(sessionsRepository, sessionsJwt)
const cacheService = new application.services.sessionCacheService(sessionsRedisAdapter);
const realtimeService = new application.services.sessionRealtimeService(cacheService);
const hydratorService = new application.services.sessionHydratorService(authService, cacheService, sessionsSocketObsAdapter)
const sessionUseCase = new application.useCases.session(realtimeService, hydratorService);

infrastructure.realtime.registerSessionDbListener(pgAdapter, sessionUseCase);
export const socketRegistry = new infrastructure.realtime.sessionSocketRegistry();

cacheService.subscribe(async (event) => {
    const getSessions = (x: string) => socketRegistry.getSessions(x)
    await sessionUseCase.syncSessions(event.client, event.users, getSessions);
});

export const { hydrateClientSession } = new adapters.bun.sessions(sessionUseCase, cookieName, paramName);
export const { hydrateSocketSession } = new adapters.socket.middlewares.sessions(sessionUseCase, cookieName, paramName, sessionsSocketObsAdapter);
export const registerNamespace = (nsp: any) => socketRegistry.registerNamespace(nsp);

