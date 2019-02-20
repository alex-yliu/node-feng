import { ContainerModule, Container } from 'inversify';
import { ModuleFactory } from '../module.loader';
import { Server as HTTPServer } from 'http';
import SocketIO from 'socket.io';
import { Server as IOServer } from 'socket.io';
import { DI as ServerDI } from '../server/server.models';
import { DI as ServerIODI, IoClientMetaStore } from './server-io.models';
import { DI, IoContext, IoClientMetaData, IoMessageMetaDataSet } from './server-io.models';
import { bind } from '../../utils';
import { DI as DILog } from '../log/log.models';
import Logger from 'bunyan';

// export function defineOnConnectContext(container: Container, ioServer: IOServer) {
//     const log = container.get<Logger>(DILog.Logger);
//     log.info({ ioServer }, 'Initializing Server Module');
//     const ioClientMetaData: IoClientMetaData = Reflect.getMetadata('LYF:IOCLIENTMETADATA', Reflect);
//     if (ioClientMetaData == null) {
//         return;
//     }
//     const ioClientConstructor = ioClientMetaData.clazz;
//     const ioClientConfig = ioClientMetaData.config;
//     const ioClientAuthMethod: string = Reflect.getMetadata('LYF:IOCLIENT:IOAUTHENTICATE', ioClientConstructor);
//     container.bind(DI.IoClient).to(ioClientConstructor);
//     container.bind<IoClientConfig>(DI.IoClientConfig).toConstantValue(ioClientConfig);
//     const ioMessageMetaDataSet: IoMessageMetaDataSet = Reflect.getMetadata('LYF:IOCLIENT:IOMESSAGEMETADATASET', ioClientConstructor);
//     ioServer.on('connection', async (socket) => {
//         // tslint:disable-next-line:no-console
//         log.info({ socket }, defineOnConnectContext.name);

//         const context: IoContext = {
//             socket,
//         };
//         // Reflect.defineMetadata('LYF:IOCLIENT:IOCONTEXT', context, socket);
//         const childContainer = container.createChild();
//         childContainer.bind<IoContext>(DI.IoContext).toConstantValue(context);
//         const ioClient = childContainer.get<any>(DI.IoClient);
//         if (ioClientAuthMethod != null) {
//             // tslint:disable-next-line:ban-types
//             const fn = bind(ioClient[ioClientAuthMethod], ioClient);
//             let authenticated = false;
//             try {
//                 if (fn.constructor.name === 'AsyncFunction') {
//                     authenticated = await fn();
//                 } else {
//                     authenticated = fn();
//                 }
//                 if (authenticated !== true) {
//                     socket.emit('authenticated', false);
//                     socket.disconnect(true);
//                 } else {
//                     socket.emit('authenticated', true);
//                 }
//             } catch (err) {
//                 socket.emit('authenticated', false, err);
//                 socket.disconnect(true);
//                 // tslint:disable-next-line:no-console
//                 console.log('exception: ', err);
//                 log.error({ err });
//             }
//         }
//         // tslint:disable-next-line:forin
//         for (const key in ioMessageMetaDataSet) {
//             const method = ioMessageMetaDataSet[key].method;
//             socket.on(key, bind(ioClient[method], ioClient));
//         }
//     });

// }

function defineIOConnectOnNamespace(container: Container, ioServer: IOServer, ns: string, metaData: IoClientMetaData) {
    const log = container.get<Logger>(DILog.Logger);
    const ioClientConstructor = metaData.clazz;
    const ioClientConfig = metaData.config;
    const ioClientAuthMethod: string = Reflect.getMetadata('LYF:IOCLIENT:IOAUTHENTICATE', ioClientConstructor);
    const ioClientErrorMethod: string = Reflect.getMetadata('LYF:IOCLIENT:IOERROR', ioClientConstructor);
    const ioClientDisconnectMethod: string = Reflect.getMetadata('LYF:IOCLIENT:IODISCONNECT', ioClientConstructor);
    const ioMessageMetaDataSet: IoMessageMetaDataSet = Reflect.getMetadata('LYF:IOCLIENT:IOMESSAGEMETADATASET', ioClientConstructor);
    ioServer.of(ns).on('connection', async (socket) => {
        try {
            const context: IoContext = {
                socket,
            };
            const childContainer = container.createChild();
            childContainer.bind(DI.IoClient).to(ioClientConstructor);
            childContainer.bind<IoContext>(DI.IoContext).toConstantValue(context);
            const ioClient = childContainer.get<any>(DI.IoClient);
            // tslint:disable-next-line:forin
            for (const key in ioMessageMetaDataSet) {
                const method = ioMessageMetaDataSet[key].method;
                socket.on(key, bind(ioClient[method], ioClient));
            }

            if (ioClientErrorMethod != null) {
                const fn = bind(ioClient[ioClientErrorMethod], ioClient);
                socket.on('error', fn);
            }

            if (ioClientDisconnectMethod != null) {
                const fn = bind(ioClient[ioClientDisconnectMethod], ioClient);
                socket.on('disconnect', fn);
            }
            if (ioClientAuthMethod != null) {
                // tslint:disable-next-line:ban-types
                const fn = bind(ioClient[ioClientAuthMethod], ioClient);
                let authenticated = false;
                try {
                    if (fn.constructor.name === 'AsyncFunction') {
                        authenticated = await fn();
                    } else {
                        authenticated = fn();
                    }
                    if (authenticated !== true) {
                        socket.emit('authenticated', false);
                        socket.disconnect(true);
                    } else {
                        socket.emit('authenticated', true);
                    }
                } catch (err) {
                    socket.emit('authenticated', false, err);
                    socket.disconnect(true);
                }
            }
        } catch (err)  {
            socket.disconnect(true);
        }

    });
}

export function defineIOConnections(container: Container, ioServer: IOServer) {
    const ioClientMetaStore: IoClientMetaStore = Reflect.getMetadata('LYF:IOCLIENTMETASTORE', Reflect);
    if (ioClientMetaStore == null) {
        return;
    }

    for (const ns of Object.keys(ioClientMetaStore)) {
        defineIOConnectOnNamespace(container, ioServer, ns, ioClientMetaStore[ns]);
    }
}

const factory: ModuleFactory = (ioEndpoint: string, transports: string[] = ['websocket']) => {
    return async (configDir: string, container: Container): Promise<ContainerModule> => {
        const server = container.get<HTTPServer>(ServerDI.HTTPServer);
        const ioServer = SocketIO(server, {
            path: ioEndpoint,
            serveClient: false,
            transports,
        });
        container.bind<IOServer>(ServerIODI.IOServer).toConstantValue(ioServer);
        // defineOnConnectContext(container, ioServer);
        defineIOConnections(container, ioServer);
        return new ContainerModule(() => {
        });
    };
};

export * from './server-io.models';
export * from './server-io.decorators';
export default factory;
