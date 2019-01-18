import { ContainerModule, Container } from 'inversify';
import { Application, RequestHandler, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { InversifyExpressServer } from 'inversify-express-utils';
import { ModuleFactory } from '../module.loader';
import { createServer, Server as HTTPServer } from 'http';
import { DI as ServerDI, SessionConfig } from './server.models';
import { DI as DILog } from '../log/log.models';
import { DI as RedisDI } from '../redis/redis.models';
import Logger from 'bunyan';
import redis from 'redis';
import expressSession, { Store } from 'express-session';
import connectRedis from 'connect-redis';
import cookieParser from 'cookie-parser';

export const defaultMiddlewares = [
    cookieParser(),
    bodyParser.text({type: 'application/graphql'}),
    bodyParser.json({ strict: false}),
    bodyParser.urlencoded({ extended: true }),
    (req: Request, res: Response, next: NextFunction) => {
        res.removeHeader('X-Powered-By');
        next();
    },
];

const factory: ModuleFactory = (
    port: number,
    middlewares: RequestHandler[],
    sessionConfig: SessionConfig | false) => {
    return async (configDir: string, container: Container): Promise<ContainerModule> => {
        const log = container.get<Logger>(DILog.Logger);
        // const appName = container.get<string>('appName');
        // const loadEnv = container.get<EnvLoader<T>>(EnvDI.EnvLoaderType);
        // const env = await loadEnv(envClazz, `${projectRoot}/envs/${appName}/${envFileName}.env`);
        container.bind<number>(ServerDI.HTTP_PORT).toConstantValue(port);
        const appServer = new InversifyExpressServer(container);
        appServer.setConfig(_app => {
            // _app.use(compression);
            middlewares.forEach( middlware => _app.use(middlware));
            if (sessionConfig !== false) {
                const sessionRedisClient = container.getNamed<redis.RedisClient>(RedisDI.RedisClient, `redis.${sessionConfig.redisEnv}`);
                if (sessionRedisClient == null) {
                    log.error(`redis.${sessionConfig.redisEnv} does not exist`, 'Redis Session configuration error');
                    return;
                }
                const RedisStore = connectRedis(expressSession);
                _app.use(expressSession({
                    store: new RedisStore({
                        client: sessionRedisClient,
                    }) as Store,
                    secret: sessionConfig.secret || 'default-secret',
                    saveUninitialized: true,
                    name: 'sessionId',
                    cookie: {
                        maxAge: (sessionConfig.expireInHours || 24 * 7) * 60 * 60 * 1000,
                    },
                }));
            }

        });
        const app = appServer.build();
        container.bind<Application>(ServerDI.Application).toConstantValue(app);
        const server = createServer(app);
        container.bind<HTTPServer>(ServerDI.HTTPServer).toConstantValue(server);

        return new ContainerModule(() => {
        });
    };
};

export * from './server.models';
export default factory;
