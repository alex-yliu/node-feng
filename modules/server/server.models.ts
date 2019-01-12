export const DI = {
    Application: Symbol.for('Application'),
    HTTPServer: Symbol.for('HttpServer'),
    HTTP_PORT: Symbol.for('HttpPort'),
};

export interface SessionConfig {
    redisEnv: string; // redis env name
    secret: string;
    expireInHours: number;
}