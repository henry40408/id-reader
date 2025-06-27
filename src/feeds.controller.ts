import fs from 'node:fs';
import { EntityManager } from '@mikro-orm/core';
import { Controller, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiSecurity,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard, RequestWithUser } from './auth.guard';
import { FORBIDDEN_CONTENT } from './content.constant';
import { UserEntity } from './entities';
import { API_SECURITY_SCHEME } from './graphql.context';
import { OpmlService } from './opml.service';

export class ImportFeedsDto {
  @ApiProperty({
    description: 'The file containing feeds to import',
    type: 'string',
    format: 'binary',
  })
  file: Express.Multer.File;
}

@Controller()
export class FeedsController {
  constructor(
    private readonly em: EntityManager,
    private readonly opmlService: OpmlService,
  ) {}

  @Post('import')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: ImportFeedsDto })
  @ApiConsumes('multipart/form-data')
  @ApiForbiddenResponse({ description: 'Forbidden', content: FORBIDDEN_CONTENT })
  @ApiOkResponse({
    description: 'Feeds imported successfully',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {},
        },
      },
    },
  })
  @ApiOperation({ summary: 'Import feeds' })
  @ApiSecurity(API_SECURITY_SCHEME)
  async importFeeds(@Req() req: RequestWithUser, @UploadedFile() file: Express.Multer.File) {
    const user = await this.em.findOneOrFail(UserEntity, { id: req.jwtPayload.sub });
    const readable = fs.createReadStream(file.path);
    await this.opmlService.importFeeds(user, readable);
    return {};
  }

  @Post('export')
  @UseGuards(AuthGuard)
  @ApiForbiddenResponse({ description: 'Forbidden', content: FORBIDDEN_CONTENT })
  @ApiOkResponse({
    description: 'Feeds exported successfully',
    content: { 'application/xml': {} },
  })
  @ApiOperation({ summary: 'Export feeds as OPML file' })
  @ApiSecurity(API_SECURITY_SCHEME)
  async exportFeeds(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response) {
    const now = new Date();
    const user = await this.em.findOneOrFail(UserEntity, { id: req.jwtPayload.sub });
    const xml = await this.opmlService.exportFeeds(user);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="feeds-${now.toISOString()}.opml"`);
    res.send(xml);
  }
}
