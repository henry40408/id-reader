import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { DataloaderService } from '../dataloader.service';
import { EntryObject } from './object-types';

@Resolver(EntryObject)
export class EntriesResolver {
  private readonly feedsLoader: DataloaderService['loaders']['feedsLoader'];
  private readonly usersLoader: DataloaderService['loaders']['usersLoader'];

  constructor(private readonly dataloader: DataloaderService) {
    this.feedsLoader = this.dataloader.loaders.feedsLoader;
    this.usersLoader = this.dataloader.loaders.usersLoader;
  }

  @ResolveField()
  async feed(@Parent() entry: EntryObject) {
    return await this.feedsLoader.load(entry.feed.id);
  }

  @ResolveField()
  async user(@Parent() entry: EntryObject) {
    return await this.usersLoader.load(entry.user.id);
  }
}
