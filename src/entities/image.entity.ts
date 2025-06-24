import crypto from 'node:crypto';
import { BeforeCreate, BeforeUpdate, Entity, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity()
@Unique({ properties: ['url', 'createdAt'] })
export class ImageEntity extends BaseEntity {
  @Property()
  url!: string;

  @Property()
  blob!: Buffer;

  @Property({ type: 'varchar', length: 255 })
  contentType!: string;

  @Property()
  sha256sum?: string;

  @Property({ nullable: true })
  etag?: string;

  @Property({ nullable: true })
  lastModified?: string;

  @BeforeCreate()
  @BeforeUpdate()
  setSha256Sum() {
    if (this.blob) this.sha256sum = crypto.createHash('sha256').update(this.blob).digest('hex');
  }
}
