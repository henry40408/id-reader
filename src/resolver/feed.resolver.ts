import { Args, Context, Field, Mutation, ObjectType, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Feed } from 'knex/types/tables';
import { IGqlContext } from '../graphql.interface';
import { CategoryObject, FeedObject, ImageObject, RequestWithJwtPayload } from '../object.interface';
import { Authenticated } from '../access-token.guard';
import { FeedMetadataService } from '../feed-metadata.service';
import { FeedRepository } from '../repository/feed.repository';
import { DataLoaderService } from '../dataloader.service';
import { IDataLoaders } from '../dataloader.interface';

@ObjectType({ description: 'Found feed' })
export class FoundFeed {
  @Field(() => String, { description: 'Title' })
  title: string;
  @Field(() => String, { description: 'XML URL' })
  xml_url: string;
  @Field(() => String, { description: 'HTML URL' })
  html_url?: string;
}

@Resolver(() => FeedObject)
export class FeedResolver {
  private readonly loaders: IDataLoaders;

  constructor(
    private readonly dataloaderService: DataLoaderService,
    private readonly feedMetadataService: FeedMetadataService,
    private readonly feedRepository: FeedRepository,
  ) {
    this.loaders = this.dataloaderService.loaders;
  }

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

  @Query(() => FoundFeed, { description: 'Detect feed' })
  @Authenticated()
  async findFeed(@Args('url') url: string): Promise<FoundFeed> {
    const found = await this.feedMetadataService.findFeed(url);
    if (!found) throw new BadRequestException('no feed is found');
    return found;
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
    return await this.loaders.categoryLoader.load(feed.category_id);
  }

  @ResolveField(() => ImageObject, { description: 'Get image', nullable: true })
  async image(@Parent() feed: FeedObject) {
    if (!feed.image_id) return null;
    return await this.loaders.imageLoader.load(feed.image_id);
  }
}
