import { ClassType } from 'class-transformer/ClassTransformer';
import { IsIn } from 'class-validator';
import { Expose } from 'class-transformer';

export const DI = {
    BaseEnv: Symbol.for('BaseEnv'),
    EnvLoaderType: Symbol.for('EnvLoader'),
};

export class BaseEnv {
    @IsIn(['development', 'staging', 'production'])
    @Expose()
    readonly NODE_ENV: string;
}

export type EnvLoader<T> = (clazz: ClassType<T>, path: string) => Promise<T>;
