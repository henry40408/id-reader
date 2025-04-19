import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity({ name: 'user' })
export class UserEntity {
  static HASH_ROUNDS = 14;

  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  passwordHash: string;

  password?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async _hashPassword() {
    if (!this.password) return;
    this.passwordHash = await bcrypt.hash(this.password, UserEntity.HASH_ROUNDS);
  }
}
