
// modules
import baseModule from './modules/base';
import envModule from './modules/env';
import serverModule, { ServerEnv } from './modules/server';
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

export const PROJECT_ROOT = path.resolve(__dirname, './');
export const INSTANCE_LAUNCH_TIME = `${Date.now()}`;

const bootstrap = new Bootstrap(PROJECT_ROOT,
                                baseModule('user'),
                                envModule(),
                                logModule(INSTANCE_LAUNCH_TIME),
                                databaseModule('master'),
                                redisModule('master'),
                                serverModule(ServerEnv, 'server.user', {
                                    redisEnv: 'master',
                                    secret: 'summereden.com',
                                    expireInHours: 24 * 30,  // expire in 30 days
                                }));
bootstrap.start().catch(e => {
    // tslint:disable-next-line:no-console
    console.log('exception: ', e);
});
