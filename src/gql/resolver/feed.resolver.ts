import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Knex } from 'knex';
import { Inject, NotFoundException } from '@nestjs/common';
import { Feed } from 'knex/types/tables';
import { KNEX } from '../../knex/knex.constant';
import { IGqlContext } from '../gql.interface';
import { CategoryObject, FeedObject, ImageObject, RequestWithJwtPayload } from '../dtos.interface';
import { Authenticated } from '../access-token.guard';
import { FeedMetadataService } from '../../feed-metadata/feed-metadata.service';

@Resolver(() => FeedObject)
export class FeedResolver {
  constructor(
    @Inject(KNEX) private readonly knex: Knex,
    private readonly feedMetadataService: FeedMetadataService,
  ) {}

  @Query(() => [FeedObject], { description: 'Get my feeds' })
  @Authenticated()
  async feeds(@Context() context: IGqlContext<RequestWithJwtPayload>) {
    const userId = context.req.jwtPayload.sub;
    return await this.knex('feeds')
      .select<Feed>('feeds.*')
      .join('categories', 'categories.id', 'feeds.category_id')
      .where('categories.user_id', userId)
      .orderBy('id');
  }

  @Query(() => FeedObject, { description: 'Get my feed by id' })
  @Authenticated()
  async feed(@Context() context: IGqlContext<RequestWithJwtPayload>, @Args('feedId') feedId: number) {
    const userId = context.req.jwtPayload.sub;
    const feed = await this.knex('feeds')
      .select<Feed>('feeds.*')
      .join('categories', 'categories.id', 'feeds.category_id')
      .where('feeds.id', feedId)
      .where('categories.user_id', userId)
      .first();
    if (!feed) throw new NotFoundException('Feed not found');
    return feed;
  }

  @Mutation(() => ImageObject, { description: 'Update feed image', nullable: true })
  @Authenticated()
  async updateFeedImage(@Context() context: IGqlContext<RequestWithJwtPayload>, @Args('feedId') feedId: number) {
    const userId = context.req.jwtPayload.sub;
    const feed = await this.knex('feeds')
      .join('categories', 'categories.id', 'feeds.category_id')
      .where('feeds.id', feedId)
      .where('categories.user_id', userId)
      .first();
    if (!feed) throw new NotFoundException('Feed not found');
    return await this.feedMetadataService.updateFeedImage(feedId);
  }

  @ResolveField(() => CategoryObject, { description: 'Get category' })
  async category(@Parent() feed: FeedObject, @Context() context: IGqlContext<RequestWithJwtPayload>) {
    return await context.loaders.categoryLoader.load(feed.category_id);
  }

  @ResolveField(() => ImageObject, { description: 'Get image', nullable: true })
  async image(@Parent() feed: FeedObject, @Context() context: IGqlContext<RequestWithJwtPayload>) {
    if (!feed.image_id) return null;
    return await context.loaders.imageLoader.load(feed.image_id);
  }
}
