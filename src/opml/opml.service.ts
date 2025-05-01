import { Readable } from 'node:stream';
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Category, Feed } from 'knex/types/tables';
import sax from 'sax';
import { DEFAULT_CATEGORY_NAME } from '../repositories/category.constants';
import { KNEX } from 'src/knex/knex.constant';

export interface ParsedFeed {
  title: string;
  xmlUrl: string;
  htmlUrl?: string;
}

export interface ParsedCategory {
  name: string;
  feeds: ParsedFeed[];
}

@Injectable()
export class OpmlService {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async importFeeds(userId: number, categories: ParsedCategory[]) {
    return await this.knex.transaction(async (tx) => {
      const categoryPromises: Promise<void>[] = [];
      for (const category of categories) {
        const task = async () => {
          const [categoryId] = await tx<Category>('categories')
            .insert({
              name: category.name,
              user_id: userId,
            })
            .onConflict(['user_id', 'name'])
            .ignore();
          const feedPromises: Promise<void>[] = [];
          for (const feed of category.feeds) {
            const task = async () => {
              await tx<Feed>('feeds')
                .insert({
                  category_id: categoryId,
                  title: feed.title,
                  xml_url: feed.xmlUrl,
                  html_url: feed.htmlUrl,
                })
                .onConflict(['category_id', 'xml_url'])
                .ignore();
            };
            feedPromises.push(task());
          }
          await Promise.all(feedPromises);
        };
        categoryPromises.push(task());
      }
      await Promise.all(categoryPromises);
    });
  }

  async parseOPML(readable: Readable) {
    return new Promise<ParsedCategory[]>((resolve, reject) => {
      const parser = sax.createStream(true);

      const categories: ParsedCategory[] = [];
      let currentCategory: ParsedCategory | undefined;

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

  private deriveString(s: string | sax.QualifiedAttribute): string {
    if (typeof s === 'string') return s;
    return s.value;
  }
}
