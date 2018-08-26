import { IsInt, IsPositive, IsString, IsUrl } from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { Socket } from 'socket.io';
import { ConstructorFunction } from '../../utils';

export const DI = {
    Application: Symbol.for('Application'),
    HTTPServer: Symbol.for('HttpServer'),
    IOServer: Symbol.for('IOServer'),
    ServerEnv: Symbol.for('ServerEnv'),
    Socket: Symbol.for('IOSocket'),
    IoContext: Symbol.for('IOContext'),
    IoClient: Symbol.for('IoClient'),
    IoClientMetaData: Symbol.for('IoClientMetaData'),
    IoClientConfig: Symbol.for('IoClientConfig'),
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
    key: string; // message endpoint key
    types: string[]; // message types
}

export interface IoClientMetaData {
    config: IoClientConfig;
    // tslint:disable-next-line:ban-types
    clazz: ConstructorFunction;
}

export interface IoMessageMetaData {
    method: string;
}

export interface IoMessageMetaDataSet {
    [key: string]: IoMessageMetaData;
}
