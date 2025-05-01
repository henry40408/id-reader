import { Inject } from '@nestjs/common';
import { Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Knex } from 'knex';
import { Category } from 'knex/types/tables';
import { Authenticated } from './auth/access-token.guard';
import { RequestWithJwtPayload } from './auth/auth.interface';
import { CategoryObject, UserObject } from './dtos';
import { IGqlContext } from './interface';
import { KNEX } from './knex/knex.constant';

@Resolver(() => CategoryObject)
export class CategoriesResolver {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  @Query(() => [CategoryObject], { description: 'get my categories' })
  @Authenticated()
  async categories(@Context() ctx: IGqlContext<RequestWithJwtPayload>) {
    const jwtPayload = ctx.req.jwtPayload;
    return await this.knex<Category>('categories').select('*').where('user_id', jwtPayload.sub);
  }

  @ResolveField(() => UserObject)
  async user(@Parent() category: CategoryObject, @Context() ctx: IGqlContext<RequestWithJwtPayload>) {
    return await ctx.loaders.usersLoader.load(category.user_id);
  }
}
