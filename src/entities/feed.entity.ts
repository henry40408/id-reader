import { Entity, ManyToOne, Property, Rel, Unique } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { CategoryEntity } from './category.entity';
import { ImageEntity } from './image.entity';
import { UserEntity } from './user.entity';

@Entity()
@Unique({ properties: ['user', 'url'] })
export class FeedEntity extends BaseEntity {
  @Property()
  title: string;

  @Property()
  url: string;

  @Property({ nullable: true })
  link?: string;

  @ManyToOne(() => UserEntity)
  user: Rel<UserEntity>;

  @ManyToOne(() => CategoryEntity)
  category: Rel<CategoryEntity>;

  @ManyToOne(() => ImageEntity, { nullable: true })
  image?: Rel<ImageEntity>;
}
