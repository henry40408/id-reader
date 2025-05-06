import { Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Knex } from 'knex';
import { Inject } from '@nestjs/common';
import { KNEX } from '../../knex/knex.constant';
import { IGqlContext } from '../gql.interface';
import { CategoryObject, FeedObject, RequestWithJwtPayload } from '../dtos';
import { Authenticated } from '../access-token.guard';

@Resolver(() => FeedObject)
export class FeedResolver {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  @Query(() => [FeedObject], { description: 'Get my feeds' })
  @Authenticated()
  async feeds(@Context() context: IGqlContext<RequestWithJwtPayload>) {
    const userId = context.req.jwtPayload.sub;
    return await this.knex('feeds')
      .select('*')
      .join('categories', 'categories.id', 'feeds.category_id')
      .where('categories.user_id', userId);
  }

  @ResolveField(() => CategoryObject, { description: 'Get category' })
  async category(@Parent() feed: FeedObject, @Context() context: IGqlContext<RequestWithJwtPayload>) {
    return await context.loaders.categoryLoader.load(feed.category_id);
  }
}
