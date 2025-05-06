import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Image } from 'knex/types/tables';
import { KNEX } from '../../knex/knex.constant';

@Injectable()
export class ImageRepository {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async create(url: string): Promise<Image> {
    const existed = await this.knex('images').where('url', url).first();
    if (existed) return existed;

    const response = await fetch(url);
    const blob = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') ?? 'image/png';

    return await this.knex.transaction(async (tx) => {
      const [imageId] = await tx('images_composite').insert({ url, blob, content_type: contentType }).into('images');
      const image = await tx('images').where('id', imageId).first();
      return image!;
    });
  }
}
