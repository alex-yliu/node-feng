import { ModuleFactory } from '../module.loader';
import { Container, ContainerModule } from 'inversify';
import { RedisEnv, DI } from './redis.models';
import { DI as EnvDI, EnvLoader } from '../env/env.models';
import redis from 'redis';

const factory: ModuleFactory = (...dbNames: string[]) => {
    return async (projectRoot: string, container: Container): Promise<ContainerModule> => {
        const appName = container.get<string>('appName');
        const loadEnv = container.get<EnvLoader<RedisEnv>>(EnvDI.EnvLoaderType);
        const redises: Map<string, redis.RedisClient> = new Map();
        for (const dbName of dbNames) {
            const env = await loadEnv(RedisEnv, `${projectRoot}/envs/${appName}/redis.${dbName}.env`);

            const redisClient = redis.createClient({
                host: env.REDIS_HOST,
                port: env.REDIS_PORT,
                db: env.REDIS_DB,
            });
            redises.set(dbName, redisClient);
        }
        return new ContainerModule(bind => {
            redises.forEach( (redisClient, dbName) => {
                bind<redis.RedisClient>(DI.RedisClient).toConstantValue(redisClient).whenTargetNamed(`redis.${dbName}`);
            });
        });
    };
};

export * from './redis.models';
export default factory;
