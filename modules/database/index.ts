import { ModuleFactory } from '../module.loader';
import { Container, ContainerModule } from 'inversify';
import { DatabaseEnv, DI } from './database.models';
import { DI as EnvDI, EnvLoader } from '../env/env.models';
import Knex from 'knex';

const factory: ModuleFactory = (...dbNames: string[]) => {
    return async (projectRoot: string, container: Container): Promise<ContainerModule> => {
        const loadEnv = container.get<EnvLoader<DatabaseEnv>>(EnvDI.EnvLoaderType);
        const knexs: Map<string, Knex> = new Map();
        for (const dbName of dbNames) {
            const env = await loadEnv(DatabaseEnv, `${projectRoot}/envs/database.${dbName}.env`);
            const knex: Knex = Knex({
                client: env.DB_CLIENT,
                connection: {
                    host: env.DB_HOST,
                    user: env.DB_USER,
                    password: env.DB_PASSWORD,
                    database: env.DB_DATABASE,
                },
            });
            knexs.set(dbName, knex);
        }
        return new ContainerModule(bind => {
            knexs.forEach( (knex, dbName) => {
                bind<Knex>(DI.Knex).toConstantValue(knex).whenTargetNamed(`database.${dbName}`);
            });
        });
    };
};

export * from './database.models';
export default factory;
