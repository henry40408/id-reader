import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ImportFeedsDTO {
  @ApiProperty({ type: 'string', format: 'binary', description: 'OPML file' })
  @IsNotEmpty()
  file!: string;
}

export class ImportFeedsResponse {
  @ApiProperty({ description: 'category count' })
  categoryCount!: number;

  @ApiProperty({ description: 'feed count' })
  feedCount!: number;
}
