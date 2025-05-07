import { Module } from '@nestjs/common';
import { RepositoryModule } from '../repository/repository.module';
import { AppConfigModule } from '../app-config/app-config.module';
import { SeedService } from './seed.service';

@Module({
  imports: [AppConfigModule, RepositoryModule],
  providers: [SeedService],
})
export class SeedModule {}
