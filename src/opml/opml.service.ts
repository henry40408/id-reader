import { Readable } from 'node:stream';
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Category, Feed, User } from 'knex/types/tables';
import sax from 'sax';
import { ApiProperty } from '@nestjs/swagger';
import { XMLBuilder } from 'fast-xml-parser';
import { KNEX } from '../knex/knex.constant';
import { DEFAULT_CATEGORY_NAME } from './opml.constant';

export interface IParsedFeed {
  title: string;
  xmlUrl: string;
  htmlUrl?: string;
}

export interface IParsedCategory {
  name: string;
  feeds: IParsedFeed[];
}

export class ImportFeedCount {
  @ApiProperty({ description: 'category count' })
  categoryCount!: number;

  @ApiProperty({ description: 'feed count' })
  feedCount!: number;
}

@Injectable()
export class OpmlService {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async importFeeds(userId: number, categories: IParsedCategory[]): Promise<ImportFeedCount> {
    return await this.knex.transaction(async (tx) => {
      let categoryCount = 0;
      let feedCount = 0;

      const categoryPromises: Promise<void>[] = [];
      for (const category of categories) {
        const task = async () => {
          const [id] = await tx<Category>('categories')
            .insert({ name: category.name, user_id: userId })
            .onConflict(['user_id', 'name'])
            .ignore();
          if (id) categoryCount += 1;

          const [{ id: categoryId }] = await tx<Category>('categories')
            .where({ user_id: userId, name: category.name })
            .select('id');

          const feedPromises: Promise<void>[] = [];
          for (const feed of category.feeds) {
            const task = async () => {
              const [id] = await tx<Feed>('feeds')
                .insert({
                  category_id: categoryId,
                  title: feed.title,
                  xml_url: feed.xmlUrl,
                  html_url: feed.htmlUrl,
                })
                .onConflict(['category_id', 'xml_url'])
                .ignore();
              if (id) feedCount += 1;
            };
            feedPromises.push(task());
          }
          await Promise.all(feedPromises);
        };
        categoryPromises.push(task());
      }
      await Promise.all(categoryPromises);

      return { categoryCount, feedCount };
    });
  }

  async parseOPML(readable: Readable) {
    return new Promise<IParsedCategory[]>((resolve, reject) => {
      const parser = sax.createStream(true);

      const categories: IParsedCategory[] = [];
      let currentCategory: IParsedCategory | undefined;

      parser.on('opentag', (node) => {
        if (node.name === 'outline') {
          const attrs = node.attributes;
          if (!attrs.xmlUrl) {
            currentCategory = {
              name: this.deriveString(attrs.text),
              feeds: [],
            };
            categories.push(currentCategory);
          } else {
            if (!currentCategory) {
              currentCategory = {
                name: DEFAULT_CATEGORY_NAME,
                feeds: [],
              };
              categories.push(currentCategory);
            }
            const title = this.deriveString(attrs.title) || this.deriveString(attrs.text);
            currentCategory.feeds.push({
              title,
              xmlUrl: this.deriveString(attrs.xmlUrl),
              htmlUrl: this.deriveString(attrs.htmlUrl),
            });
          }
        }
      });

      parser.on('error', (err) => {
        reject(err);
      });

      parser.on('end', () => {
        resolve(categories);
      });

      readable.pipe(parser);
    });
  }

  async exportOPML(userId: number, batchSize = 10) {
    const user = await this.knex<User>('users').where({ id: userId }).first();
    if (!user) throw new Error('User not found');

    const builder = new XMLBuilder({ ignoreAttributes: false });
    const outlines: IParsedCategory[] = [];

    let offset = 0;
    let categories = await this.knex<Category>('categories')
      .where({ user_id: userId })
      .offset(offset)
      .limit(batchSize)
      .orderBy('id', 'asc');
    while (categories.length > 0) {
      for (const category of categories) {
        let offset2 = 0;
        let feeds = await this.knex<Feed>('feeds')
          .where({ category_id: category.id })
          .orderBy('id', 'asc')
          .offset(offset2)
          .limit(batchSize);
        while (feeds.length > 0) {
          outlines.push({
            name: category.name,
            feeds: feeds.map((feed) => ({
              title: feed.title,
              xmlUrl: feed.xml_url,
              htmlUrl: feed.html_url,
            })),
          });
          offset2 += 10;
          feeds = await this.knex<Feed>('feeds')
            .where({ category_id: category.id })
            .orderBy('id', 'asc')
            .offset(offset2)
            .limit(batchSize);
        }
      }
      offset += batchSize;
      categories = await this.knex<Category>('categories')
        .where({ user_id: userId })
        .offset(offset)
        .limit(batchSize)
        .orderBy('id', 'asc');
    }
    return builder.build({
      '?xml': {
        '@_version': '1.0',
        '@_encoding': 'UTF-8',
      },
      opml: {
        '@_version': '1.0',
        head: { title: `Exported from id-reader (username: ${user.username})`, dateCreated: new Date().toUTCString() },
        body: {
          outline: outlines.map((outline) => ({
            '@_text': outline.name,
            outline: outline.feeds.map((feed) => ({
              '@_text': feed.title,
              '@_title': feed.title,
              '@_htmlUrl': feed.htmlUrl,
              '@_xmlUrl': feed.xmlUrl,
            })),
          })),
        },
      },
    });
  }

  private deriveString(s: string | sax.QualifiedAttribute): string {
    if (!s) return '';
    if (typeof s === 'string') return s;
    return s.value;
  }
}
