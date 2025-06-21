import { EntityManager } from '@mikro-orm/core';
import { UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard, RequestWithUser } from '../auth.guard';
import { FeedEntity } from '../entities';
import { GraphQLContext } from '../graphql.context';
import { FeedObject } from './object-types';

@Resolver()
export class FeedsResolver {
  constructor(private readonly em: EntityManager) {}

  @Query(() => [FeedObject])
  @UseGuards(AuthGuard)
  async getFeeds(@Context() ctx: GraphQLContext<RequestWithUser>) {
    const userId = ctx.req.jwtPayload.sub;
    return await this.em.find(FeedEntity, { user: userId }, { populate: ['user', 'category'] });
  }
}
