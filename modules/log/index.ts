import { ModuleFactory } from '../module.loader';
import { Container, ContainerModule } from 'inversify';
import { DI as EnvDI, EnvLoader } from '../env/env.models';
import { DI } from './log.models';
import Logger from 'bunyan';
import path from 'path';

const factory: ModuleFactory = (sid: string, logDir: string) => {
    return async (configDir: string, container: Container): Promise<ContainerModule> => {
        const appName = container.get<string>('appName');
        const fileName = path.basename(__filename);
        const log: Logger = Logger.createLogger({
            name: appName,
            sid,
            streams: [{
                path: `${logDir}/${fileName}.${appName}.${sid}.${process.pid}.log`,
            }],
        });
        return new ContainerModule(bind => {
            bind<Logger>(DI.Logger).toConstantValue(log);
            bind<string>('START_ID').toConstantValue(sid);
        });
    };
};

export * from './log.models';
export default factory;
