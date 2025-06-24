import { Entity, Enum, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity()
@Unique({ properties: ['name', 'externalId'] })
export class JobLogEntity extends BaseEntity {
  @Property()
  name!: string;

  @Property()
  externalId!: string;

  @Enum(() => ['ok', 'err'])
  status!: 'ok' | 'err';

  // result when status is 'success'
  // error when status is 'error'
  @Property({ type: 'json' })
  payload!: { type: 'ok'; result: unknown } | { type: 'err'; error: unknown };
}
