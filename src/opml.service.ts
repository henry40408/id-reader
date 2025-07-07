import { Readable } from 'node:stream';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import sax from 'sax';
import xml2js from 'xml2js';
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
  constructor(private readonly em: EntityManager) {}

  async importFeeds(user: UserEntity, readable: Readable) {
    const em = this.em.fork();

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

      const category = new CategoryEntity();
      category.user = user;
      category.name = categoryName || DEFAULT_CATEGORY_NAME;

      await em.upsert(CategoryEntity, category, { onConflictAction: 'ignore' });

      for (const feed of outline.children) {
        if (!feed.xmlUrl) continue;

        const feedEntity = new FeedEntity();
        feedEntity.user = user;
        feedEntity.category = category;
        feedEntity.title = feed.text;
        feedEntity.url = feed.xmlUrl;
        feedEntity.link = feed.htmlUrl;

        await em.upsert(FeedEntity, feedEntity, { onConflictAction: 'ignore' });
      }
    }

    await em.flush();
  }

  async exportFeeds(user: UserEntity): Promise<string> {
    const now = new Date();
    const feeds = await this.em.find(FeedEntity, { user }, { populate: ['category'] });

    const outlines: OpmlOutline[] = [];
    const categoriesMap: Record<string, OpmlOutline> = {};

    for (const feed of feeds) {
      const categoryName = feed.category?.name || DEFAULT_CATEGORY_NAME;
      if (!categoriesMap[categoryName]) {
        categoriesMap[categoryName] = {
          text: categoryName,
          children: [],
        };
        outlines.push(categoriesMap[categoryName]);
      }
      categoriesMap[categoryName].children.push({
        text: feed.title,
        xmlUrl: feed.url,
        htmlUrl: feed.link,
        children: [],
      });
    }

    const builder = new xml2js.Builder();
    const opml = {
      opml: {
        $: { version: '2.0' },
        head: { title: `Exported Feeds (${now.toISOString()})` },
        body: {
          outline: outlines.map((outline) => {
            const attrs: Record<string, string> = { text: outline.text };
            if (outline.xmlUrl) attrs.xmlUrl = outline.xmlUrl;
            if (outline.htmlUrl) attrs.htmlUrl = outline.htmlUrl;
            return {
              $: attrs,
              outline: outline.children.map((child) => ({
                $: {
                  text: child.text,
                  xmlUrl: child.xmlUrl || '',
                  htmlUrl: child.htmlUrl || '',
                },
              })),
            };
          }),
        },
      },
    };
    return builder.buildObject(opml);
  }

  private getAttributeValue(v?: string | sax.QualifiedAttribute): string {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.value;
  }
}
