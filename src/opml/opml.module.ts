import { Module } from '@nestjs/common';
import { OpmlService } from './opml.service';
import { RepositoryModule } from '../repository/repository.module';

@Module({
  imports: [RepositoryModule],
  providers: [OpmlService],
  exports: [OpmlService],
})
export class OpmlModule {}
