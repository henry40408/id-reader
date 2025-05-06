import { Module } from '@nestjs/common';
import { DataLoaderService } from './dataloader.service';
import { RepositoryModule } from './repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class DataLoaderModule {}
