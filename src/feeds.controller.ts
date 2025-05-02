import * as fs from 'node:fs';
import { Controller, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Authenticated } from './auth/access-token.guard';
import { RequestWithJwtPayload } from './auth/auth.interface';
import { ImportFeedsResponse, UploadedFileDTO } from './dtos';
import { OpmlService } from './opml/opml.service';
import { CategoryRepository } from './repositories/category.repository';
import { FeedRepository } from './repositories/feed.repository';

@Controller('feeds')
export class FeedsController {
  constructor(
    private readonly opmlService: OpmlService,
    private readonly categoryRepository: CategoryRepository,
    private readonly feedRepository: FeedRepository,
  ) {}

  @Post('import')
  @Authenticated()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'import feeds from OPML file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadedFileDTO })
  @ApiResponse({ type: ImportFeedsResponse })
  async importFeeds(
    @Req() req: RequestWithJwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImportFeedsResponse> {
    const payload = req.jwtPayload;
    const stream = fs.createReadStream(file.path);
    const categories = await this.opmlService.parseOPML(stream);
    await this.opmlService.importFeeds(payload.sub, categories);
    const [categoryCount, feedCount] = await Promise.all([
      this.categoryRepository.count(payload.sub),
      this.feedRepository.count(payload.sub),
    ]);
    return {
      categoryCount,
      feedCount,
    };
  }
}
