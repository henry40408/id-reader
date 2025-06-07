import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { FeedEntity } from './feed.entity';
import { UserEntity } from './user.entity';

@Entity()
@Unique(['userId', 'name'])
export class CategoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.categories, {
    onDelete: 'CASCADE',
  })
  user: Relation<UserEntity>;

  @OneToMany(() => FeedEntity, (feed) => feed.category, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  feeds: Relation<FeedEntity[]>;
}
