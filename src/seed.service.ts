import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { AppConfigService } from './app-config/app-config.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly userRepository: UserRepository,
  ) {}

  async seed() {
    if (this.appConfigService.config.env.production) throw new Error('Cannot seed in production');

    await this.userRepository.clear();
    this.logger.log('Cleared users');

    await this.userRepository.create({ username: 'admin', password: 'password' });
    this.logger.log('Created admin user');
  }
}
