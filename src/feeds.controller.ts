import * as fs from 'node:fs';
import { Controller, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Authenticated } from './auth/access-token.guard';
import { RequestWithJwtPayload } from './auth/auth.interface';
import { UploadedFileDTO } from './dtos';
import { OpmlService } from './opml/opml.service';

@Controller('feeds')
export class FeedsController {
  constructor(private readonly opmlService: OpmlService) {}

  @Post('import')
  @Authenticated()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'import feeds from OPML file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadedFileDTO })
  async importFeeds(@Req() req: RequestWithJwtPayload, @UploadedFile() file: Express.Multer.File) {
    const payload = req.jwtPayload;
    const stream = fs.createReadStream(file.path);
    const categories = await this.opmlService.parseOPML(stream);
    await this.opmlService.importFeeds(payload.sub, categories);
    return {};
  }
}
