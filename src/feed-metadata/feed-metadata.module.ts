import { Module } from '@nestjs/common';
import { RepositoryModule } from '../repository/repository.module';
import { FeedMetadataService } from './feed-metadata.service';

@Module({
  imports: [RepositoryModule],
  providers: [FeedMetadataService],
  exports: [FeedMetadataService],
})
export class FeedMetadataModule {}
