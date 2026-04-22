import { io } from "@hola/hola-server";

import * as adapters from "@/adapters"
import * as application from "@/application"
import * as bootstrap from "@/bootstrap"

const usersRepository = new adapters.pg.repositories.users(adapters.pg.clients.sql);
const sessionsRepository = new adapters.pg.repositories.sessions(adapters.pg.clients.sql);

try {
    const authUseCase = new application.useCases.auth({
        repositories: {
            users: usersRepository,
            sessions: sessionsRepository,
        }
    });

    const authController = new adapters.socket.controllers.auth({
        namespace: '/auth',
        middlewares: [bootstrap.sessions.hydrateSocketSession],
        useCase: authUseCase
    });

    authController.bind(io);
    authController.attach(bootstrap.sessions.registerNamespace);
} catch (error) {
    console.error(error);
}

const managerRepository = new adapters.pg.repositories.manager(adapters.pg.clients.sql);

try {
    const managerRedis = new adapters.redis.adapters.manager(
        adapters.redis.connections.client,
        adapters.redis.connections.publisher,
        adapters.redis.connections.subscriber
    );

    const managerUseCase = new application.useCases.manager({
        repositories: {
            users: new adapters.pg.repositories.users(adapters.pg.clients.sql),
            manager: managerRepository
        },
        cache: managerRedis,
        events: managerRedis
    });

    const managerController = new adapters.socket.controllers.manager({
        namespace: '/manager',
        middlewares: [bootstrap.sessions.hydrateSocketSession],
        useCase: managerUseCase
    });

    managerController.bind(io);
    managerController.attach(bootstrap.sessions.registerNamespace);
} catch (error) {
    console.error(error);
}

try {
    const health = new adapters.socket.controllers.health({
        namespace: '/health',
    });
    health.bind(io);
    health.attach(bootstrap.sessions.registerNamespace);
} catch (error) {

}