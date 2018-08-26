import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class LogEnv {
    @IsString()
    @Expose()
    LOG_NAME: string;
}

export const DI = {
    Logger: Symbol.for('Logger'),
};
