import { EntityManager } from '@mikro-orm/core';
import { UserInputError } from '@nestjs/apollo';
import { Logger, UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { milliseconds, millisecondsToSeconds } from 'date-fns';
import sanitizeHtml from 'sanitize-html';
import { AuthGuard, RequestWithUser } from '../auth.guard';
import { DataloaderService } from '../dataloader.service';
import { CategoryEntity, EntryEntity, FeedEntity, ImageEntity, UserEntity } from '../entities';
import { FeedService } from '../feed.service';
import { GraphQLContext } from '../graphql.context';
import { ImageService } from '../image.service';
import { EntryObject, FeedObject } from './object-types';

@Resolver(FeedObject)
export class FeedsResolver {
  private readonly logger = new Logger(FeedsResolver.name);

  private readonly categoriesLoader: DataloaderService['loaders']['categoriesLoader'];
  private readonly entriesLoader: DataloaderService['loaders']['entriesLoader'];
  private readonly imagesLoader: DataloaderService['loaders']['imagesLoader'];
  private readonly usersLoader: DataloaderService['loaders']['usersLoader'];

  constructor(
    private readonly dataloader: DataloaderService,
    private readonly em: EntityManager,
    private readonly feedService: FeedService,
    private readonly imageService: ImageService,
  ) {
    this.categoriesLoader = this.dataloader.loaders.categoriesLoader;
    this.entriesLoader = this.dataloader.loaders.entriesLoader;
    this.imagesLoader = this.dataloader.loaders.imagesLoader;
    this.usersLoader = this.dataloader.loaders.usersLoader;
  }

  @Mutation(() => FeedObject, { description: 'Download the image for a feed' })
  @UseGuards(AuthGuard)
  async downloadFeedImage(
    @Context() ctx: GraphQLContext<RequestWithUser>,
    @Args('id', { type: () => Int, description: 'The ID of the feed to update' }) feedId: number,
  ) {
    const userId = ctx.req.jwtPayload.sub;

    const feed = await this.em.findOne(FeedEntity, { id: feedId, user: userId });
    if (!feed) throw new UserInputError('Feed not found');

    const image = await this.imageService.downloadFeedImage(feed);
    if (!image) throw new UserInputError('No image found for this feed');

    return await this.em.findOneOrFail(FeedEntity, { id: feed.id });
  }

  @Mutation(() => Boolean, { description: 'Download feed images for all feeds' })
  @UseGuards(AuthGuard)
  downloadFeedImages(
    @Context() ctx: GraphQLContext<RequestWithUser>,
    @Args('seconds', {
      type: () => Int,
      description: 'The number of seconds to look back for feed images',
      defaultValue: millisecondsToSeconds(milliseconds({ days: 30 })),
    })
    seconds: number,
  ): boolean {
    const userId = ctx.req.jwtPayload.sub;
    this.imageService.downloadFeedImages(userId, seconds).catch((err) => {
      this.logger.error(err);
    });
    return true;
  }

  @Mutation(() => Boolean, { description: 'Fetch entries' })
  @UseGuards(AuthGuard)
  fetchEntries(@Context() ctx: GraphQLContext<RequestWithUser>) {
    const userId = ctx.req.jwtPayload.sub;
    const seconds = millisecondsToSeconds(milliseconds({ days: 30 }));
    this.feedService.fetchEntries(userId, seconds).catch((err) => {
      this.logger.error(err);
    });
    return true;
  }

  @Mutation(() => FeedObject, { description: 'Fetch entries for a feed' })
  @UseGuards(AuthGuard)
  async fetchFeedEntries(
    @Context() ctx: GraphQLContext<RequestWithUser>,
    @Args('id', { type: () => Int, description: 'The ID of the feed to fetch entries for' }) feedId: number,
  ): Promise<FeedEntity> {
    const userId = ctx.req.jwtPayload.sub;
    const feed = await this.em.findOne(FeedEntity, { id: feedId, user: userId });
    if (!feed) throw new UserInputError('Feed not found');
    this.feedService.fetchFeedEntries(feed).catch((err) => {
      this.logger.error(err);
    });
    return feed;
  }

  @Query(() => [EntryObject], { description: 'Get entries for a specific feed' })
  @UseGuards(AuthGuard)
  async getEntries(@Context() ctx: GraphQLContext<RequestWithUser>): Promise<EntryEntity[]> {
    const userId = ctx.req.jwtPayload.sub;
    const entires = await this.em.findAll(EntryEntity, {
      where: { user: userId },
      orderBy: { isoDate: 'DESC' },
    });
    return entires.map((entry) => {
      if (entry.content) entry.content = sanitizeHtml(entry.content);
      return entry;
    });
  }

  @Query(() => [FeedObject], { description: 'Get all feeds for the current user' })
  @UseGuards(AuthGuard)
  async getFeeds(@Context() ctx: GraphQLContext<RequestWithUser>) {
    const userId = ctx.req.jwtPayload.sub;
    return await this.em.find(FeedEntity, { user: userId });
  }

  @ResolveField()
  async category(@Parent() feed: FeedObject): Promise<CategoryEntity | null> {
    return await this.categoriesLoader.load(feed.category.id);
  }

  @ResolveField()
  async entries(@Parent() feed: FeedObject): Promise<EntryEntity[]> {
    const onlyIds = await this.em.find(EntryEntity, { feed: feed.id }, { fields: ['id'] });
    const entries = await this.entriesLoader.loadMany(onlyIds.map((entry) => entry.id));
    return entries.filter((entry) => entry instanceof EntryEntity);
  }

  @ResolveField()
  async image(@Parent() feed: FeedObject): Promise<ImageEntity | null> {
    if (!feed.image || !feed.image.id) return null;
    return await this.imagesLoader.load(feed.image.id);
  }

  @ResolveField()
  async user(@Parent() feed: FeedObject): Promise<UserEntity | null> {
    return await this.usersLoader.load(feed.user.id);
  }
}
