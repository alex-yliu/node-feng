import { ModuleFactory } from '../module.loader';
import { Container, ContainerModule } from 'inversify';
import { DI } from './log.models';
import Logger from 'bunyan';

const factory: ModuleFactory = (logDir: string, fileName: string) => {
    return async (configDir: string, container: Container): Promise<ContainerModule> => {
        const appName = container.get<string>('appName');
        const log: Logger = Logger.createLogger({
            name: appName,
            streams: [{
                path: `${logDir}/${fileName}.log`,
            }],
        });
        return new ContainerModule(bind => {
            bind<Logger>(DI.Logger).toConstantValue(log);
        });
    };
};

export * from './log.models';
export default factory;
