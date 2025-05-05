import fs from 'node:fs';
import { Controller, Inject, Logger, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { ImportFeedsDTO, ImportFeedsResponse } from './dtos';
import { OpmlService } from './opml/opml.service';
import { Authenticated } from './gql/access-token.guard';
import { RequestWithPayload } from './gql/dtos';
import { KNEX } from './knex/knex.constant';
import { Knex } from 'knex';

@Controller('feeds')
export class FeedsController {
  private readonly logger = new Logger(FeedsController.name);

  constructor(
    @Inject(KNEX) private readonly knex: Knex,
    private readonly opmlService: OpmlService,
  ) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @Authenticated()
  @ApiOperation({ summary: 'import feeds' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportFeedsDTO })
  async importFeeds(
    @Req() req: RequestWithPayload,
    @UploadedFile('file') file: Express.Multer.File,
  ): Promise<ImportFeedsResponse> {
    const userId = req.jwtPayload.sub;
    const parsed = await this.opmlService.parseOPML(fs.createReadStream(file.path));
    await this.opmlService.importFeeds(userId, parsed);
    const [{ count: categoryCount }, { count: feedCount }] = await Promise.all([
      this.knex.count('*', { as: 'count' }).from('categories').where('user_id', userId).first(),
      this.knex
        .count('*', { as: 'count' })
        .from('feeds')
        .join('categories', 'categories.id', 'feeds.category_id')
        .where('categories.user_id', userId)
        .first(),
    ]);
    this.logger.log(`user #${userId} now has ${categoryCount} categories and ${feedCount} feeds`);
    return {
      categoryCount,
      feedCount,
    };
  }
}
