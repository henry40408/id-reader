import { EntityManager } from '@mikro-orm/core';
import { UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard, RequestWithUser } from '../auth.guard';
import { CategoryEntity } from '../entities';
import { GraphQLContext } from '../graphql.context';
import { CategoryObject } from './object-types';

@Resolver()
export class CategoriesResolver {
  constructor(private readonly em: EntityManager) {}

  @Query(() => [CategoryObject], { description: 'Get all categories' })
  @UseGuards(AuthGuard)
  async categories(@Context() ctx: GraphQLContext<RequestWithUser>): Promise<CategoryEntity[]> {
    const userId = ctx.req.jwtPayload.sub;
    return await this.em.find(CategoryEntity, { user: userId }, { populate: ['user'] });
  }
}
