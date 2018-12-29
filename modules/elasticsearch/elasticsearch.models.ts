import { Expose, Type, Transform } from 'class-transformer';
import { IsString, IsUrl, IsArray } from 'class-validator';

export class ElasticSearchEnv {
    @IsArray()
    @Expose()
    @Transform((value) => (value as string).split(','), {toClassOnly: true})
    ES_ENDPOINTS: string[];
}

export const DI = {
    ElasticSearch: Symbol.for('ElasticSearch'),
};
