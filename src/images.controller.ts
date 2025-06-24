import { EntityManager } from '@mikro-orm/core';
import { Controller, Get, Param, Res, UseGuards, NotFoundException } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthGuard } from './auth.guard';
import { FORBIDDEN_CONTENT, NOT_FOUND_CONTENT } from './content.constant';
import { ImageEntity } from './entities';
import { ACCESS_TOKEN_KEY } from './graphql.context';

@Controller('images')
export class ImagesController {
  constructor(private readonly em: EntityManager) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiForbiddenResponse({ description: 'Forbidden', content: FORBIDDEN_CONTENT })
  @ApiNotFoundResponse({ description: 'Image not found', content: NOT_FOUND_CONTENT })
  @ApiOkResponse({
    description: 'Returns the image data',
    content: {
      'image/*': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Retrieve an image by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the image to retrieve' })
  @ApiSecurity(ACCESS_TOKEN_KEY)
  async getImage(@Param('id') id: string, @Res({ passthrough: true }) res: Response): Promise<void> {
    const image = await this.em.findOne(ImageEntity, { id: Number(id) });
    if (!image) throw new NotFoundException(`Image with ID ${id} not found`);
    res.header('Content-Type', image.contentType).send(image.blob);
  }
}
