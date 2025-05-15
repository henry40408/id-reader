import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ImageObject } from '../dtos.interface';

@Resolver(() => ImageObject)
export class ImageResolver {
  @ResolveField(() => String, { description: 'Data URL' })
  dataUrl(@Parent() image: ImageObject): string {
    return `data:${image.content_type};base64,${image.blob.toString('base64')}`;
  }
}
