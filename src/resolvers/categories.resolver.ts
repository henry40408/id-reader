import { EntityManager } from '@mikro-orm/core';
import { UserInputError } from '@nestjs/apollo';
import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
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

  @Mutation(() => CategoryObject, { description: 'Create a new category' })
  @UseGuards(AuthGuard)
  async createCategory(
    @Context() ctx: GraphQLContext<RequestWithUser>,
    @Args('name', { type: () => String, description: 'The name of the category' }) name: string,
  ): Promise<CategoryEntity> {
    const userId = ctx.req.jwtPayload.sub;
    const category = this.em.create(CategoryEntity, { name, user: userId });
    await this.em.persistAndFlush(category);
    return await this.em.findOneOrFail(CategoryEntity, { id: category.id }, { populate: ['user'] });
  }

  @Mutation(() => Boolean, { description: 'Delete a category by ID' })
  @UseGuards(AuthGuard)
  async deleteCategory(
    @Context() ctx: GraphQLContext<RequestWithUser>,
    @Args('id', { type: () => Number, description: 'The ID of the category to delete' }) id: number,
  ): Promise<boolean> {
    const userId = ctx.req.jwtPayload.sub;
    const category = await this.em.findOne(CategoryEntity, { id, user: userId });
    if (!category) throw new UserInputError('Category not found');
    await this.em.removeAndFlush(category);
    return true;
  }
}
