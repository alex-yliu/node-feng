import { ContainerModule, Container } from 'inversify';
import { DI as DILog } from './log/log.models';
import { Server } from 'http';
import { DI } from './server/server.models';
import Logger from 'bunyan';

export type ModuleCreator = (projectRoot: string, container: Container) => ContainerModule | Promise<ContainerModule>;
export type ModuleFactory = (...args: any[]) => ModuleCreator;
export type ModuleLoader = (projectRoot: string, ...moduleCreators: ModuleCreator[]) => Promise<Container>;

export const load: ModuleLoader = async (configDir: string, ...moduleCreators: ModuleCreator[]): Promise<Container> => {
    const container = new Container();
    for (const creator of moduleCreators) {

        const mod = await creator(configDir, container);
        (mod instanceof ContainerModule) ? container.load(mod) : container.loadAsync(mod);

    }
    return container;
};

export type StartScript = (container: Container, server: Server, port: number) => Promise<void>;

export const defaultStartScript: StartScript = (container: Container, server: Server, port: number): Promise<void> => {
    return new Promise((resolve, reject) => {
        server.listen(port, () => {
            // tslint:disable-next-line:no-console
            console.log('Listening on port: ', port);
            resolve();
        }).on('error', err => {
            // tslint:disable-next-line:no-console
            console.error('Error Listening on port: ', port, err);
            reject(err);
        });
    });
};

export class Bootstrap {
    private container?: Container;
    private server?: Server;
    private port?: number;
    moduleCreators: ModuleCreator[];
    constructor(private configDir: string, ...moduleCreators: ModuleCreator[]) {
        this.moduleCreators = moduleCreators;
    }

    async start(script: StartScript = defaultStartScript): Promise<void> {
        this.container = await load(this.configDir, ...this.moduleCreators);
        const logger = this.container.get<Logger>(DILog.Logger);
        this.server = this.container.get<Server>(DI.HTTPServer);
        this.port = this.container.get<number>(DI.HTTP_PORT);
        try {
            await script(this.container, this.server, this.port);
            logger.info({ server: this.server, port: this.port }, 'Application Started');
        } catch (err) {
            logger.fatal({ server: this.server, port: this.port }, 'Application Start Process Failed');
            throw err;
        }
    }
    async stop(): Promise<void> {
        this.server && this.server.close();
        this.container && this.container.unbindAll();
    }
}
