import { Module } from '@nestjs/common';
import { AppConfigModule } from '../app-config/app-config.module';
import { ViteService } from './vite.service';

@Module({
  imports: [AppConfigModule],
  providers: [ViteService],
  exports: [ViteService],
})
export class ViteModule {}
