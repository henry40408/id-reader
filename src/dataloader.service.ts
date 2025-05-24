import { Injectable, Logger } from '@nestjs/common';
import DataLoader from 'dataloader';
import { IDataLoaders } from './dataloader.interface';
import { KnexService } from './knex.service';

@Injectable()
export class DataLoaderService {
  private readonly logger = new Logger(DataLoaderService.name);

  constructor(private readonly knexService: KnexService) {}

  get loaders(): IDataLoaders {
    return {
      categoryLoader: new DataLoader(async (ids: number[]) => {
        const categories = await this.knexService.connection('categories').whereIn('id', ids);
        this.logger.debug(`Categories loaded: ${String(ids)}`);
        return this.reorder(ids, categories);
      }),
      imageLoader: new DataLoader(async (ids: number[]) => {
        const images = await this.knexService.connection('images').whereIn('id', ids);
        this.logger.debug(`Images loaded: ${String(ids)}`);
        return this.reorder(ids, images);
      }),
      userLoader: new DataLoader(async (ids: number[]) => {
        const users = await this.knexService.connection('users').whereIn('id', ids);
        this.logger.debug(`Users loaded: ${String(ids)}`);
        return this.reorder(ids, users);
      }),
    };
  }

  private reorder<T extends { id: number }>(ids: number[], items: T[]) {
    return ids.map((id) => items.find((i) => i.id === id)).filter((i) => !!i);
  }
}
