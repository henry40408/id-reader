import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppConfigService } from './app-config.module';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async seed() {
    if (this.appConfigService.config.appEnv.production)
      throw new Error('Seeding is not allowed in production environment');

    this.logger.log('Seeding the database.');

    const userRepository = this.dataSource.getRepository(UserEntity);

    await userRepository.deleteAll();
    this.logger.log('Deleted existing users.');

    const user = new UserEntity();
    user.username = 'admin';
    user.password = 'password';

    await userRepository.save(user);
    this.logger.log(`Created user: ${user.username}`);

    this.logger.log('Database seeding completed.');
  }
}
