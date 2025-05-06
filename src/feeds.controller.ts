import fs from 'node:fs';
import { Controller, Inject, Logger, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Knex } from 'knex';
import { ImportFeedsDTO, ImportFeedsResponse } from './dtos';
import { ImportFeedCount, OpmlService } from './opml/opml.service';
import { Authenticated } from './gql/access-token.guard';
import { RequestWithPayload } from './gql/dtos';
import { KNEX } from './knex/knex.constant';

@Controller({ version: '1', path: 'feeds' })
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
  @ApiOkResponse({ type: ImportFeedCount })
  async importFeeds(
    @Req() req: RequestWithPayload,
    @UploadedFile('file') file: Express.Multer.File,
  ): Promise<ImportFeedsResponse> {
    const userId = req.jwtPayload.sub;
    const parsed = await this.opmlService.parseOPML(fs.createReadStream(file.path));
    const { categoryCount, feedCount } = await this.opmlService.importFeeds(userId, parsed);
    this.logger.log(`user #${userId}: ${categoryCount} categories and ${feedCount} feeds imported`);
    return { categoryCount, feedCount };
  }
}
