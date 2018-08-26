import { decorate, injectable } from 'inversify';

export interface DiClassMetaData {
    scope: DIScope;
    target: any;
}

export type DIScope = 'singleton' | 'request' | 'transient';

export function diClass(scope: DIScope = 'transient'): ClassDecorator {
    // tslint:disable-next-line:ban-types
    return (clazz: any): void => {
        const metaData: DiClassMetaData = {
            scope,
            target: clazz,
        };
        decorate(injectable(), clazz);
        if (!Reflect.hasMetadata('LYF:DICLASS', Reflect)) {
            Reflect.defineMetadata('LYF:DICLASS', [], Reflect);
        }
        const metaDataSet: DiClassMetaData[] = Reflect.getMetadata('LYF:DICLASS', Reflect);
        metaDataSet.push(metaData);
    };
}
