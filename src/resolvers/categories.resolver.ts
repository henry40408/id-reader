import { EntityManager } from '@mikro-orm/core';
import { UserInputError } from '@nestjs/apollo';
import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AuthGuard, RequestWithUser } from '../auth.guard';
import { DataloaderService } from '../dataloader.service';
import { CategoryEntity, FeedEntity, UserEntity } from '../entities';
import { GraphQLContext } from '../graphql.context';
import { CategoryObject } from './object-types';

@Resolver(CategoryObject)
export class CategoriesResolver {
  private readonly feedsLoader: DataloaderService['loaders']['feedsLoader'];
  private readonly usersLoader: DataloaderService['loaders']['usersLoader'];

  constructor(
    private readonly dataloader: DataloaderService,
    private readonly em: EntityManager,
  ) {
    this.feedsLoader = this.dataloader.loaders.feedsLoader;
    this.usersLoader = this.dataloader.loaders.usersLoader;
  }

  @Query(() => [CategoryObject], { description: 'Get all categories' })
  @UseGuards(AuthGuard)
  async getCategories(@Context() ctx: GraphQLContext<RequestWithUser>): Promise<CategoryEntity[]> {
    const userId = ctx.req.jwtPayload.sub;
    return await this.em.find(CategoryEntity, { user: userId });
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
    return await this.em.findOneOrFail(CategoryEntity, { id: category.id });
  }

  @Mutation(() => Boolean, { description: 'Delete a category by ID' })
  @UseGuards(AuthGuard)
  async deleteCategory(
    @Context() ctx: GraphQLContext<RequestWithUser>,
    @Args('id', { type: () => Int, description: 'The ID of the category to delete' }) id: number,
  ): Promise<boolean> {
    const userId = ctx.req.jwtPayload.sub;
    const category = await this.em.findOne(CategoryEntity, { id, user: userId });
    if (!category) throw new UserInputError('Category not found');
    await this.em.removeAndFlush(category);
    return true;
  }

  @ResolveField()
  async feeds(@Parent() category: CategoryObject): Promise<FeedEntity[]> {
    return await this.em.find(FeedEntity, { category: category.id });
  }

  @ResolveField()
  async user(@Parent() category: CategoryObject): Promise<UserEntity | null> {
    return await this.usersLoader.load(category.user.id);
  }
}
