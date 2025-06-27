import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from './app-config.module';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly appConfigService: AppConfigService,
  ) {}

  async seed() {
    if (this.appConfigService.config.appEnv.production)
      throw new Error('Seeding is not allowed in production environment');

    const em = this.em.fork();

    this.logger.log('Seeding the database.');

    await em.nativeDelete(UserEntity, {});
    this.logger.log('Deleted existing users.');

    const user = new UserEntity();
    user.username = 'admin';
    user.password = 'password';

    em.persist(user);
    this.logger.log(`Created user: ${user.username}`);

    await em.flush();
    this.logger.log('Database seeding completed.');
  }
}
