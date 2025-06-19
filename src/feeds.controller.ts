import fs from 'node:fs';
import { Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiProperty, ApiSecurity } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthGuard, RequestWithUser } from './auth.guard';
import { UserEntity } from './entities/user.entity';
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
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    private readonly opmlService: OpmlService,
  ) {}

  @Post('import')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: ImportFeedsDto })
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Import feeds' })
  @ApiSecurity(API_SECURITY_SCHEME)
  async importFeeds(@Req() req: RequestWithUser, @UploadedFile() file: Express.Multer.File) {
    const user = await this.userRepository.findOneOrFail({ where: { id: req.jwtPayload.sub } });
    const readable = fs.createReadStream(file.path);
    await this.opmlService.importFeeds(user, readable);
    return {};
  }
}
