import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Image } from 'knex/types/tables';
import { firstValueFrom } from 'rxjs';
import { KNEX } from '../knex/knex.constant';

@Injectable()
export class ImageRepository {
  constructor(
    @Inject(KNEX) private readonly knex: Knex,
    private readonly httpService: HttpService,
  ) {}

  async create(url: string): Promise<Image> {
    const { data } = await firstValueFrom(this.httpService.get<ArrayBuffer>(url, { responseType: 'arraybuffer' }));
    return this.knex.transaction(async (tx) => {
      await tx<Image>('images').insert({ url, blob: data }).onConflict('url').ignore();
      const image = await tx<Image>('images').where('url', url).select('*').first();
      return image!;
    });
  }

  async findByUrl(url: string): Promise<Image | undefined> {
    return this.knex<Image>('images').where('url', url).select('*').first();
  }
}
