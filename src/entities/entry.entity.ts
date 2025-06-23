import { Entity, ManyToOne, Property, Unique } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { FeedEntity, UserEntity } from '.';

@Entity()
@Unique({ properties: ['user', 'feed', 'guid'] })
export class EntryEntity extends BaseEntity {
  @Property()
  guid!: string;

  @Property()
  title!: string;

  @Property({ nullable: true })
  content?: string;

  @Property({ nullable: true })
  summary?: string;

  @Property({ nullable: true })
  link?: string; // use original link if available

  @Property({ nullable: true })
  pubDate?: Date;

  @Property({ nullable: true })
  creator?: string;

  @Property({ nullable: true })
  categories?: string[];

  @ManyToOne(() => FeedEntity)
  feed!: FeedEntity;

  @ManyToOne(() => UserEntity)
  user!: UserEntity;
}
