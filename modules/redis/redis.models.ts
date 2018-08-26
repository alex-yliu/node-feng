import { Expose, Type } from 'class-transformer';
import { IsString, IsInt, IsPositive } from 'class-validator';

export class RedisEnv {
    @IsString()
    @Expose()
    REDIS_HOST: string;
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    @Expose()
    REDIS_PORT: number;
    @IsString()
    @Expose()
    REDIS_DB: string;
}

export const DI = {
    RedisClient: Symbol.for('RedisClient'),
};
