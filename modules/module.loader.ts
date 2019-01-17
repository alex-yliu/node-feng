import { ContainerModule, Container } from 'inversify';

import { Server } from 'http';
import { DI } from './server/server.models';

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

export class Bootstrap {
    private container?: Container;
    private server?: Server;
    private port?: number;
    moduleCreators: ModuleCreator[];
    constructor(private configDir: string, ...moduleCreators: ModuleCreator[]) {
        this.moduleCreators = moduleCreators;
    }

    async start(): Promise<void> {
        this.container = await load(this.configDir, ...this.moduleCreators);
        this.server = this.container.get<Server>(DI.HTTPServer);
        this.port = this.container.get<number>(DI.HTTP_PORT);
        this.server.listen(this.port, () => {
            // tslint:disable-next-line:no-console
            console.log('Listening on port: ', this.port);
        }).on('error', err => {
            // tslint:disable-next-line:no-console
            console.error('Error Listening on port: ', this.port, err);
            throw err;
        });
    }
    async stop(): Promise<void> {
        this.server && this.server.close();
        this.container && this.container.unbindAll();
    }
}
