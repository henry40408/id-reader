import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Image } from 'knex/types/tables';
import { KNEX } from '../knex/knex.constant';

@Injectable()
export class ImageRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async create(url: string): Promise<Image> {
    const response = await fetch(url);
    const blob = Buffer.from(await response.arrayBuffer());

    const contentType = response.headers.get('Content-Type');
    if (!contentType) throw new Error('Content-Type header is required');

    return this.knex.transaction(async (tx) => {
      await tx<Image>('images').insert({ url, blob, content_type: contentType }).onConflict('url').ignore();
      const image = await tx<Image>('images').where('url', url).select('*').first();
      return image!;
    });
  }

  async findByUrl(url: string): Promise<Image | undefined> {
    return this.knex<Image>('images').where('url', url).select('*').first();
  }
}
