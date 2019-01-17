import { ModuleFactory } from '../module.loader';
import { Container, ContainerModule } from 'inversify';
import { ElasticSearchEnv, DI } from './elasticsearch.models';
import { DI as EnvDI, EnvLoader } from '../env/env.models';
import { Client } from 'elasticsearch';

const factory: ModuleFactory = (...esNames: string[]) => {
    return async (configDir: string, container: Container): Promise<ContainerModule> => {
        const loadEnv = container.get<EnvLoader<ElasticSearchEnv>>(EnvDI.EnvLoaderType);
        const appName = container.get<string>('appName');
        const esClients: Map<string, Client> = new Map();
        for (const esName of esNames) {
            const env = await loadEnv(ElasticSearchEnv, `${configDir}/envs/elasticsearch.${esName}.env`);
            const client = new Client({
                host: env.ES_ENDPOINTS,
            });
            esClients.set(esName, client);
        }
        return new ContainerModule(bind => {
            esClients.forEach( (client, esName) => {
                bind<Client>(DI.ElasticSearch).toConstantValue(client).whenTargetNamed(`elasticsearch.${esName}`);
            });
        });
    };
};

export * from './elasticsearch.models';
export default factory;
