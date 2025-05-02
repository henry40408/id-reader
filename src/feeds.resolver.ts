import { Inject } from '@nestjs/common';
import { Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Knex } from 'knex';
import { Feed } from 'knex/types/tables';
import { Authenticated } from './auth/access-token.guard';
import { RequestWithJwtPayload } from './auth/auth.interface';
import { CategoryObject, FeedObject } from './dtos';
import { IGqlContext } from './interface';
import { KNEX } from './knex/knex.constant';

@Resolver(() => FeedObject)
export class FeedsResolver {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  @Query(() => [FeedObject])
  @Authenticated()
  async feeds(@Context() context: IGqlContext<RequestWithJwtPayload>) {
    const jwtPayload = context.req.jwtPayload;
    return this.knex<Feed>('feeds')
      .select('feeds.*')
      .join('categories', 'feeds.category_id', 'categories.id')
      .where('categories.user_id', jwtPayload.sub);
  }

  @ResolveField(() => CategoryObject)
  async category(@Parent() feed: FeedObject, @Context() context: IGqlContext<RequestWithJwtPayload>) {
    return context.loaders.categoriesLoader.load(feed.category_id);
  }
}
