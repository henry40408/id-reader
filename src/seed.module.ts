import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { AppConfigModule } from './app-config/app-config.module';
import { KnexService } from './knex.service';
import { UserRepository } from './repository/user.repository';

@Module({
  imports: [AppConfigModule],
  providers: [KnexService, SeedService, UserRepository],
  exports: [SeedService],
})
export class SeedModule {}
