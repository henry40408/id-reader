import { Readable } from 'node:stream';
import { Injectable } from '@nestjs/common';
import sax from 'sax';
import { DataSource } from 'typeorm';
import { CategoryEntity } from './entities/category.entity';
import { FeedEntity } from './entities/feed.entity';
import { UserEntity } from './entities/user.entity';

export const DEFAULT_CATEGORY_NAME = 'Uncategorized';

export interface OpmlOutline {
  text: string;
  xmlUrl?: string;
  htmlUrl?: string;
  children: OpmlOutline[];
}

@Injectable()
export class OpmlService {
  constructor(private readonly dataSource: DataSource) {}

  async importFeeds(user: UserEntity, readable: Readable) {
    return await this.dataSource.transaction(async (manager) => {
      const categoryRepository = manager.getRepository(CategoryEntity);
      const feedRepository = manager.getRepository(FeedEntity);

      const outlines = await new Promise<OpmlOutline[]>((resolve, reject) => {
        const outlines: OpmlOutline[] = [];
        const parser = sax.createStream(true);

        parser.on('error', (error) => reject(error));

        const traversed: ('category' | 'feed')[] = [];

        parser.on('opentag', (node) => {
          if (node.name !== 'outline' || !node.attributes.text) return;

          const attrs = node.attributes;
          const text = this.getAttributeValue(attrs.text);

          // category
          if (!attrs.xmlUrl) {
            const category: OpmlOutline = {
              text,
              children: [],
            };
            outlines.push(category);
            traversed.push('category');
          }

          // feed
          if (attrs.xmlUrl) {
            const feed: OpmlOutline = {
              text,
              xmlUrl: this.getAttributeValue(attrs.xmlUrl),
              htmlUrl: this.getAttributeValue(attrs.htmlUrl),
              children: [],
            };
            if (traversed[traversed.length - 1] === 'category') {
              const lastCategory = outlines[outlines.length - 1];
              if (lastCategory && lastCategory.children) {
                lastCategory.children.push(feed);
              } else {
                outlines.push({
                  text: DEFAULT_CATEGORY_NAME,
                  children: [feed],
                });
              }
            } else {
              const defaultCategory = outlines.find((outline) => outline.text === DEFAULT_CATEGORY_NAME);
              if (defaultCategory) {
                defaultCategory.children.push(feed);
              } else {
                outlines.push({
                  text: DEFAULT_CATEGORY_NAME,
                  children: [feed],
                });
              }
            }
            traversed.push('feed');
          }
        });

        parser.on('closetag', (name) => {
          if (name !== 'outline') return;
          traversed.pop();
        });

        parser.on('end', () => {
          resolve(outlines);
        });

        readable.pipe(parser);
      });

      for (const outline of outlines) {
        const categoryName = outline.text;

        const value = { userId: user.id, name: categoryName };
        await categoryRepository
          .createQueryBuilder()
          .insert()
          .into(CategoryEntity)
          .values(value)
          .orIgnore()
          .updateEntity(false)
          .execute();

        const category = await categoryRepository.findOneOrFail({ where: value });

        for (const feed of outline.children) {
          await feedRepository
            .createQueryBuilder()
            .insert()
            .into(FeedEntity)
            .values({
              categoryId: category.id,
              userId: user.id,
              title: feed.text,
              url: feed.xmlUrl,
              link: feed.htmlUrl,
            })
            .orIgnore()
            .updateEntity(false)
            .execute();
        }
      }
    });
  }

  private getAttributeValue(v?: string | sax.QualifiedAttribute): string {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.value;
  }
}
