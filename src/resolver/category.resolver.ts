import { Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Category } from 'knex/types/tables';
import { CategoryObject, RequestWithJwtPayload, UserObject } from '../object.interface';
import { IGqlContext } from '../graphql.interface';
import { Authenticated } from '../access-token.guard';
import { KnexService } from '../knex.service';
import { IDataLoaders } from '../dataloader.interface';
import { DataLoaderService } from '../dataloader.service';

@Resolver(() => CategoryObject)
export class CategoryResolver {
  private readonly loaders: IDataLoaders;

  constructor(
    private readonly knexService: KnexService,
    private readonly dataloaderService: DataLoaderService,
  ) {
    this.loaders = this.dataloaderService.loaders;
  }

  @Query(() => [CategoryObject], { description: 'Get my categories' })
  @Authenticated()
  async categories(@Context() context: IGqlContext<RequestWithJwtPayload>) {
    const userId = context.req.jwtPayload.sub;
    return await this.knexService.connection<Category>('categories').select('*').where('user_id', userId);
  }

  @ResolveField(() => UserObject, { description: 'Get user' })
  async user(@Parent() category: CategoryObject) {
    return await this.loaders.userLoader.load(category.user_id);
  }
}
