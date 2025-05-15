import { Module } from '@nestjs/common';
import { RepositoryModule } from '../repository/repository.module';
import { DataLoaderService } from './dataloader.service';

@Module({
  imports: [RepositoryModule],
  providers: [DataLoaderService],
  exports: [DataLoaderService],
})
export class DataLoaderModule {}
