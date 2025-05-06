import { Module } from '@nestjs/common';
import { RepositoryModule } from '../repository/repository.module';
import { OpmlService } from './opml.service';

@Module({
  imports: [RepositoryModule],
  providers: [OpmlService],
  exports: [OpmlService],
})
export class OpmlModule {}
