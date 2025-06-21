import { Entity, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity()
@Unique({ properties: ['url', 'createdAt'] })
export class ImageEntity extends BaseEntity {
  @Property()
  url: string;

  @Property()
  blob: Buffer;

  @Property({ type: 'varchar', length: 255 })
  contentType: string;
}
