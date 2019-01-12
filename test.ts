
// modules
import baseModule from './modules/base';
import envModule from './modules/env';
import serverModule, { defaultMiddlewares } from './modules/server';
import serverIoModule from './modules/server-io';
import databaseModule from './modules/database';
import redisModule from './modules/redis';
import logModule from './modules/log';
import { Bootstrap } from './modules/module.loader';
import path from 'path';
import { interfaces, httpGet, controller, request } from 'inversify-express-utils';
import * as express from 'express';

// io Client

// controllers
@controller('/test')
export class TestController implements interfaces.Controller {

    constructor() {
        // tslint:disable-next-line:no-console
        console.log('/test controller created');
    }

    @httpGet('/status')
    public async status(@request() req: express.Request): Promise<string> {
        return 'status';
    }

}

// datamarts
// import './datamarts/user.datamart';

// services

// utils
// import './utils/crypto.util';

export const CONFIG_DIR = path.resolve(__dirname, './');
export const LOG_DIR = path.resolve(__dirname, './');
export const INSTANCE_LAUNCH_TIME = `${Date.now()}`;
export const HTTP_PORT = 8181;
export const IO_ENDPOINT = '/endpoint/1';

const bootstrap = new Bootstrap(CONFIG_DIR,
                                baseModule('user'),
                                envModule(),
                                logModule(INSTANCE_LAUNCH_TIME, LOG_DIR),
                                databaseModule('master'),
                                redisModule('master'),
                                serverModule(HTTP_PORT,
                                            defaultMiddlewares,
                                            {
                                                redisEnv: 'master',
                                                secret: 'summereden.com',
                                                expireInHours: 24 * 30,  // expire in 30 days
                                            }),
                                serverIoModule(IO_ENDPOINT));
bootstrap.start().catch(e => {
    // tslint:disable-next-line:no-console
    console.log('exception: ', e);
});
