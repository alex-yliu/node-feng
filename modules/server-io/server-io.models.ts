import { IsInt, IsPositive, IsString, IsUrl } from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { Socket } from 'socket.io';
import { ConstructorFunction } from '../../utils';

export const DI = {
    IOServer: Symbol.for('IOServer'),
    IoContext: Symbol.for('IOContext'),
    IoClient: Symbol.for('IoClient'),
};

export class ServerEnv {
    @IsString()
    @IsUrl()
    @Expose()
    readonly HOST_NAME: string;

    @IsInt()
    @IsPositive()
    @Type(() => Number)
    @Expose()
    readonly HTTP_PORT: number;

    @IsString()
    @Expose()
    readonly ENDPOINT_PATH: string;
}

export interface IoContext {
    socket: Socket;
}

export interface IoClientConfig {
    namespace: string;
}

export interface IoClientMetaData {
    config: IoClientConfig;
    // tslint:disable-next-line:ban-types
    clazz: ConstructorFunction;
}

export interface IoClientMetaStore {
    [key: string]: IoClientMetaData;
}

export interface IoMessageMetaData {
    method: string;
}

export interface IoMessageMetaDataSet {
    [key: string]: IoMessageMetaData;
}

export interface ServerConfig {
    session?: {
        redisEnv: string; // redis env name
        secret: string;
        expireInHours: number;
    };
}