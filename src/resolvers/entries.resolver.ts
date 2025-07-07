import { EntityManager } from '@mikro-orm/core';
import { UseGuards } from '@nestjs/common';
import { Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AuthGuard, RequestWithUser } from '../auth.guard';
import { DataloaderService } from '../dataloader.service';
import { EntryEntity } from '../entities';
import { GraphQLContext } from '../graphql.context';
import { EntryObject } from './object-types';

@Resolver(EntryObject)
export class EntriesResolver {
  private readonly feedsLoader: DataloaderService['loaders']['feedsLoader'];
  private readonly usersLoader: DataloaderService['loaders']['usersLoader'];

  constructor(
    private readonly dataloader: DataloaderService,
    private readonly em: EntityManager,
  ) {
    this.feedsLoader = this.dataloader.loaders.feedsLoader;
    this.usersLoader = this.dataloader.loaders.usersLoader;
  }

  @Query(() => [EntryObject], { description: 'Get unread entries' })
  @UseGuards(AuthGuard)
  async getUnreadEntries(@Context() ctx: GraphQLContext<RequestWithUser>): Promise<EntryEntity[]> {
    const userId = ctx.req.jwtPayload.sub;
    return await this.em.find(EntryEntity, { user: userId, readAt: null }, { orderBy: { isoDate: 'DESC' } });
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
