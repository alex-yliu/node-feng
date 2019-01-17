
import { Container, ContainerModule } from 'inversify';
import dotenv from 'dotenv';
import { DI, BaseEnv } from './env.models';

import { ModuleCreator, ModuleFactory } from '../module.loader';
import { EnvLoader } from './env.models';
import {plainToClass} from 'class-transformer';
import { ClassType } from 'class-transformer/ClassTransformer';
import { validate } from 'class-validator';

async function loadEnv<T>(clazz: ClassType<T>, path: string): Promise<T> {
    dotenv.config({path});
    const env = plainToClass(clazz, process.env, { strategy: 'excludeAll' });
    const errors = await validate(env);
    if (errors.length > 0) {
        throw errors;
    }
    return env;
}

const factory: ModuleFactory = (): ModuleCreator => {
    return async (configDir: string, container: Container): Promise<ContainerModule> => {
        const appName = container.get<string>('appName');
        // tslint:disable-next-line:no-console
        console.log('appName: ', appName, `${configDir}/envs/node.env`);
        const env = await loadEnv(BaseEnv, `${configDir}/envs/node.env`);

        return new ContainerModule( bind => {
            bind<EnvLoader<any>>(DI.EnvLoaderType).toFunction(loadEnv);
            bind<BaseEnv>(DI.BaseEnv).toConstantValue(env);
        });
    };
};

export * from './env.models';
export default factory;
