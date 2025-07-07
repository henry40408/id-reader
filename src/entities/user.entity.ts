import { Entity, Unique, OneToMany, BeforeUpdate, Property, Collection, BeforeCreate } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from './base.entity';
import { CategoryEntity } from './category.entity';

@Entity()
@Unique({ properties: 'username' })
export class UserEntity extends BaseEntity {
  @Property()
  username: string;

  @Property()
  passwordHash: string;

  @OneToMany(() => CategoryEntity, (category) => category.user)
  categories = new Collection<CategoryEntity>(this);

  password?: string;

  @BeforeCreate()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) this.passwordHash = await bcrypt.hash(this.password, 10);
  }
}
