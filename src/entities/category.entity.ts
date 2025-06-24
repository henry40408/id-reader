import { Collection, Entity, ManyToOne, OneToMany, Property, Rel, Unique } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { FeedEntity } from './feed.entity';
import { UserEntity } from './user.entity';

@Entity()
@Unique({
  properties: ['user', 'name'],
})
export class CategoryEntity extends BaseEntity {
  @Property()
  name!: string;

  @ManyToOne(() => UserEntity)
  user!: Rel<UserEntity>;

  @OneToMany(() => FeedEntity, (feed) => feed.category)
  feeds = new Collection<FeedEntity>(this);
}
