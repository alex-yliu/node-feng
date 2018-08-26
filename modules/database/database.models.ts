import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class DatabaseEnv {
    @IsString()
    @Expose()
    DB_CLIENT: string;
    @IsString()
    @Expose()
    DB_HOST: string;
    @IsString()
    @Expose()
    DB_USER: string;
    @IsString()
    @Expose()
    DB_PASSWORD: string;
    @IsString()
    @Expose()
    DB_DATABASE: string;
}

export const DI = {
    Knex: Symbol.for('Database'),
};
