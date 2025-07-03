import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { CategoryEntity, EntryEntity, FeedEntity, ImageEntity, UserEntity } from './entities';

export interface IDataLoaders {
  categoriesLoader: DataLoader<number, CategoryEntity | null>;
  entriesLoader: DataLoader<number, EntryEntity | null>;
  feedsLoader: DataLoader<number, FeedEntity | null>;
  imagesLoader: DataLoader<number, ImageEntity | null>;
  usersLoader: DataLoader<number, UserEntity | null>;
}

@Injectable()
export class DataloaderService {
  constructor(private readonly em: EntityManager) {}

  get loaders(): IDataLoaders {
    return {
      categoriesLoader: new DataLoader<number, CategoryEntity | null>(async (ids: number[]) => {
        const categories = await this.em.find(CategoryEntity, { id: { $in: ids } });
        return this.remap(ids, categories);
      }),
      entriesLoader: new DataLoader<number, EntryEntity | null>(async (ids: number[]) => {
        const entries = await this.em.find(EntryEntity, { id: { $in: ids } });
        return this.remap(ids, entries);
      }),
      feedsLoader: new DataLoader<number, FeedEntity | null>(async (ids: number[]) => {
        const feeds = await this.em.find(FeedEntity, { id: { $in: ids } });
        return this.remap(ids, feeds);
      }),
      imagesLoader: new DataLoader<number, ImageEntity | null>(async (ids: number[]) => {
        const images = await this.em.find(ImageEntity, { id: { $in: ids } });
        return this.remap(ids, images);
      }),
      usersLoader: new DataLoader<number, UserEntity | null>(async (ids: number[]) => {
        const users = await this.em.find(UserEntity, { id: { $in: ids } });
        return this.remap(ids, users);
      }),
    };
  }

  private remap<T extends { id: number }>(ids: number[], objects: T[]): (T | null)[] {
    const entityMap = new Map(objects.map((obj) => [obj.id, obj]));
    return ids.map((id) => entityMap.get(id) || null);
  }
}
