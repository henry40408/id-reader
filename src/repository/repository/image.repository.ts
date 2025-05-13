import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { Image } from 'knex/types/tables';
import { KNEX } from '../../knex/knex.constant';

@Injectable()
export class ImageRepository {
  private readonly logger = new Logger(ImageRepository.name);

  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async create(url: string): Promise<Image> {
    const existed = await this.knex('images').where('url', url).first();
    if (existed) {
      const isLatest = await this.isLatest(existed);
      if (isLatest) return existed;
    }

    const response = await fetch(url);
    if (!response.ok) {
      this.logger.error(`Failed to fetch image from ${url}`);
      throw new Error(`Failed to fetch image from ${url}`);
    }

    const blob = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') ?? 'image/png';
    const etag = response.headers.get('etag') ?? undefined;
    if (!etag) {
      this.logger.warn(`No etag found for ${url}`);
    }
    const lastModified = response.headers.get('last-modified') ?? undefined;
    if (!lastModified) {
      this.logger.warn(`No last modified found for ${url}`);
    }

    return await this.knex.transaction(async (tx) => {
      await tx('images_composite')
        .insert({ url, blob, content_type: contentType, etag, last_modified: lastModified })
        .into('images')
        .onConflict('url')
        .merge({
          blob,
          content_type: contentType,
          etag,
          last_modified: lastModified,
        });
      const image = await tx('images').where('url', url).first();
      return image!;
    });
  }

  private async isLatest(image: Image): Promise<boolean> {
    const url = image.url;

    const headers = new Headers();
    if (image.etag) headers.set('If-None-Match', image.etag);
    if (image.last_modified) headers.set('If-Modified-Since', image.last_modified);

    const resp = await fetch(url, { method: 'HEAD', headers });
    if (!resp.ok) {
      if (resp.status === Number(HttpStatus.NOT_MODIFIED)) {
        this.logger.log(`Image ${url} is not modified`);
        return true;
      }
      this.logger.error(`Failed to fetch image from ${url}`);
      return false;
    }

    const etag = resp.headers.get('etag');
    const isEtagMatched = !!etag && etag === image.etag;
    if (isEtagMatched) {
      this.logger.log(`Etag matched for ${url}`);
    }

    const lastModified = resp.headers.get('last-modified');
    let isLastModifiedLatest = false;
    if (lastModified && image.last_modified) {
      const expected = new Date(image.last_modified);
      const actual = new Date(lastModified);
      isLastModifiedLatest = expected >= actual;
    }
    if (isLastModifiedLatest) {
      this.logger.log(`Last modified matched for ${url}`);
    }

    return isEtagMatched || isLastModifiedLatest;
  }
}
