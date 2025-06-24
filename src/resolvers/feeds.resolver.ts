import { EntityManager } from '@mikro-orm/core';
import { UserInputError } from '@nestjs/apollo';
import { Logger, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { milliseconds, millisecondsToSeconds } from 'date-fns';
import { AuthGuard, RequestWithUser } from '../auth.guard';
import { FeedEntity } from '../entities';
import { GraphQLContext } from '../graphql.context';
import { ImageService } from '../image.service';
import { FeedObject } from './object-types';

@Resolver()
export class FeedsResolver {
  private readonly logger = new Logger(FeedsResolver.name);

  constructor(
    private readonly em: EntityManager,
    private readonly imageService: ImageService,
  ) {}

  @Query(() => [FeedObject])
  @UseGuards(AuthGuard)
  async getFeeds(@Context() ctx: GraphQLContext<RequestWithUser>) {
    const userId = ctx.req.jwtPayload.sub;
    return await this.em.find(FeedEntity, { user: userId }, { populate: ['user', 'category', 'image'] });
  }

  @Mutation(() => FeedObject)
  @UseGuards(AuthGuard)
  async updateFeedImage(
    @Context() ctx: GraphQLContext<RequestWithUser>,
    @Args('id', { type: () => Number, description: 'The ID of the feed to update' }) feedId: number,
  ) {
    const userId = ctx.req.jwtPayload.sub;

    const feed = await this.em.findOne(FeedEntity, { id: feedId, user: userId });
    if (!feed) throw new UserInputError('Feed not found');

    const image = await this.imageService.downloadFeedImage(feed);
    if (!image) throw new UserInputError('No image found for this feed');

    return await this.em.findOneOrFail(FeedEntity, { id: feed.id }, { populate: ['image', 'user', 'category'] });
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  updateFeedImages(
    @Context() ctx: GraphQLContext<RequestWithUser>,
    @Args('seconds', {
      type: () => Number,
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
}
