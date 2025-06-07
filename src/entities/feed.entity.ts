import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryEntity } from './category.entity';

@Entity()
@Unique(['userId', 'categoryId', 'url'])
export class FeedEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  categoryId: number;

  @Column()
  title: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  link?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => CategoryEntity, (category) => category.feeds, {
    onDelete: 'CASCADE',
  })
  category: Relation<CategoryEntity>;
}
