import { decorate, injectable } from 'inversify';
import { IoClientConfig, IoClientMetaData, IoMessageMetaDataSet } from './server.models';

export function ioClient(config: IoClientConfig): ClassDecorator {
    // tslint:disable-next-line:ban-types
    return (clazz: any): void => {
        decorate(injectable(), clazz);
        const metadata: IoClientMetaData = {
            config,
            clazz,
        };
        if (Reflect.hasMetadata('LYF:IOCLIENTMETADATA', Reflect)) {
            throw new Error(`DUPLICATE IOCLIENTMETADATA: ${clazz.name}`);
        }
        Reflect.defineMetadata('LYF:IOCLIENTMETADATA', metadata, Reflect);
    };
}

export function ioMessage(event: string): MethodDecorator {
    // tslint:disable-next-line:ban-types
    return (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {

        if (!Reflect.hasMetadata('LYF:IOCLIENT:IOMESSAGEMETADATASET', target.constructor)) {
            Reflect.defineMetadata('LYF:IOCLIENT:IOMESSAGEMETADATASET', {}, target.constructor);
        }
        const metaDataSet: IoMessageMetaDataSet = Reflect.getMetadata('LYF:IOCLIENT:IOMESSAGEMETADATASET', target.constructor);
        metaDataSet[event] = {
            method: propertyKey,
        };
    };
}

// tslint:disable-next-line:ban-types
export function ioAuthenicate(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {

    if (Reflect.hasMetadata('LYF:IOCLIENT:IOAUTHENTICATE', target.constructor)) {
        const existed = Reflect.getMetadata('LYF:IOCLIENT:IOAUTHENTICATE', target.constructor);
        throw new Error(`DUPLICATE IOAUTHENTICATE: ${target.constructor.name}, defined(${existed}), new(${propertyKey})`);
    }
    Reflect.defineMetadata('LYF:IOCLIENT:IOAUTHENTICATE', propertyKey, target.constructor);

}
