import fs from 'node:fs';
import { Controller, Get, Inject, Logger, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ApiBody, ApiConsumes, ApiForbiddenResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { Knex } from 'knex';
import { ImportFeedsDTO, ImportFeedsResponse } from './dtos.interface';
import { ImportFeedCount, OpmlService } from './opml/opml.service';
import { Authenticated } from './gql/access-token.guard';
import { RequestWithJwtPayload } from './gql/dtos.interface';
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
  @ApiOperation({
    summary: 'import feeds',
    description: 'Import feeds from OPML file. Existing categories and feeds will be ignored.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: ImportFeedsDTO })
  @ApiOkResponse({ type: ImportFeedCount, description: 'count of imported categories and feeds' })
  @ApiForbiddenResponse({ description: 'user not found' })
  async importFeeds(
    @Req() req: RequestWithJwtPayload,
    @UploadedFile('file') file: Express.Multer.File,
  ): Promise<ImportFeedsResponse> {
    const userId = req.jwtPayload.sub;
    const parsed = await this.opmlService.parseOPML(fs.createReadStream(file.path));
    const { categoryCount, feedCount } = await this.opmlService.importFeeds(userId, parsed);
    this.logger.log(`user #${userId}: ${categoryCount} categories and ${feedCount} feeds imported`);
    return { categoryCount, feedCount };
  }

  @Get('export')
  @Authenticated()
  @ApiOperation({ summary: 'export feeds', description: 'Export feeds and download as an OPML file.' })
  @ApiOkResponse({ type: String, description: 'exported OPML file' })
  @ApiForbiddenResponse({ description: 'user not found' })
  async exportFeeds(@Req() req: RequestWithJwtPayload, @Res() res: Response): Promise<void> {
    const userId = req.jwtPayload.sub;
    const opml = await this.opmlService.exportOPML(userId);
    res.setHeader('Content-Type', 'text/x-opml; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="feeds.opml"');
    res.send(opml);
  }
}
