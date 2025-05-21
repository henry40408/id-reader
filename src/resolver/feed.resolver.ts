import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { NotFoundException } from '@nestjs/common';
import { Feed } from 'knex/types/tables';
import { IGqlContext } from '../graphql.interface';
import { CategoryObject, FeedObject, ImageObject, RequestWithJwtPayload } from '../object.interface';
import { Authenticated } from '../access-token.guard';
import { FeedMetadataService } from '../feed-metadata.service';
import { FeedRepository } from '../repository/feed.repository';
import { DataLoaderService } from '../dataloader.service';

@Resolver(() => FeedObject)
export class FeedResolver {
  constructor(
    private readonly dataloaderService: DataLoaderService,
    private readonly feedMetadataService: FeedMetadataService,
    private readonly feedRepository: FeedRepository,
  ) {}

  @Query(() => [FeedObject], { description: 'Get my feeds' })
  @Authenticated()
  async feeds(@Context() context: IGqlContext<RequestWithJwtPayload>) {
    const userId = context.req.jwtPayload.sub;
    return await this.feedRepository.findByUserId(userId).select<Feed>('feeds.*');
  }

  @Query(() => FeedObject, { description: 'Get my feed by id' })
  @Authenticated()
  async feed(@Context() context: IGqlContext<RequestWithJwtPayload>, @Args('feedId') feedId: number) {
    const userId = context.req.jwtPayload.sub;
    const feed = await this.feedRepository.findByUserId(userId).where('feeds.id', feedId).first();
    if (!feed) throw new NotFoundException('Feed not found');
    return feed;
  }

  @Mutation(() => ImageObject, { description: 'Update feed image', nullable: true })
  @Authenticated()
  async updateFeedImage(@Context() context: IGqlContext<RequestWithJwtPayload>, @Args('feedId') feedId: number) {
    const userId = context.req.jwtPayload.sub;
    const feed = await this.feedRepository.findByUserId(userId).where('feeds.id', feedId).first();
    if (!feed) throw new NotFoundException('Feed not found');
    return await this.feedMetadataService.updateFeedImage(feedId);
  }

  @ResolveField(() => CategoryObject, { description: 'Get category' })
  async category(@Parent() feed: FeedObject) {
    return await this.dataloaderService.loaders.categoryLoader.load(feed.category_id);
  }

  @ResolveField(() => ImageObject, { description: 'Get image', nullable: true })
  async image(@Parent() feed: FeedObject) {
    if (!feed.image_id) return null;
    return await this.dataloaderService.loaders.imageLoader.load(feed.image_id);
  }
}
