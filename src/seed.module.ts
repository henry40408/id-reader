import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from './app-config.module';
import { OrmModule } from './orm/orm.module';
import { SeedService } from './seed.service';

@Module({
  imports: [AppConfigModule, ConfigModule, OrmModule],
  providers: [SeedService],
})
export class SeedModule {}
