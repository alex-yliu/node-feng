
import { Container, ContainerModule } from 'inversify';
import { ModuleCreator, ModuleFactory } from '../module.loader';
import { DiClassMetaData } from '../di.decorators';

const factory: ModuleFactory = (appName: string): ModuleCreator => {
    return async (projectRoot: string, container: Container): Promise<ContainerModule> => {
        const diClasses: DiClassMetaData[] = Reflect.getMetadata('LYF:DICLASS', Reflect) || [];
        return new ContainerModule( bind => {
            bind('appName').toConstantValue(appName);
            for (const diClass of diClasses) {
                if (diClass.scope === 'singleton') {
                    bind(diClass.target).toSelf().inSingletonScope();
                } else if (diClass.scope === 'request') {
                    bind(diClass.target).toSelf().inRequestScope();
                } else if (diClass.scope === 'transient') {
                    bind(diClass.target).toSelf().inTransientScope();
                }
            }
        });
    };
};

export default factory;
