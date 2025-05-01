import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../app-config/app-config.service';
import { UserRepository } from '../repositories/user.repository';

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
    this.logger.log('users table cleared');

    await this.userRepository.createUser({
      username: 'admin',
      password: 'password',
    });
    this.logger.log('admin user created');
  }
}
