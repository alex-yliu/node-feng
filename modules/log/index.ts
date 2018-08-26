import { ModuleFactory } from '../module.loader';
import { Container, ContainerModule } from 'inversify';
import { DI as EnvDI, EnvLoader } from '../env/env.models';
import { LogEnv, DI } from './log.models';
import Logger from 'bunyan';

const factory: ModuleFactory = (sid: string) => {
    return async (projectRoot: string, container: Container): Promise<ContainerModule> => {
        const appName = container.get<string>('appName');
        const loadEnv = container.get<EnvLoader<LogEnv>>(EnvDI.EnvLoaderType);
        const env = await loadEnv(LogEnv, `${projectRoot}/envs/bunyan.env`);
        const log: Logger = Logger.createLogger({
            name: appName,
            sid,
            streams: [{
                path: `./${appName}.log`,
            }],
        });
        return new ContainerModule(bind => {
            bind<Logger>(DI.Logger).toConstantValue(log);
        });
    };
};

export * from './log.models';
export default factory;
