import { Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Knex } from 'knex';
import { Category } from 'knex/types/tables';
import { InjectKnex } from '../../knex/knex.constant';
import { CategoryObject, RequestWithJwtPayload, UserObject } from '../dtos.interface';
import { IGqlContext } from '../gql.interface';
import { Authenticated } from '../access-token.guard';

@Resolver(() => CategoryObject)
export class CategoryResolver {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  @Query(() => [CategoryObject], { description: 'Get my categories' })
  @Authenticated()
  async categories(@Context() context: IGqlContext<RequestWithJwtPayload>) {
    const userId = context.req.jwtPayload.sub;
    return await this.knex<Category>('categories').select('*').where('user_id', userId);
  }

  @ResolveField(() => UserObject, { description: 'Get user' })
  async user(@Parent() category: CategoryObject, @Context() context: IGqlContext<RequestWithJwtPayload>) {
    return await context.loaders.userLoader.load(category.user_id);
  }
}
