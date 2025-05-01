import { Readable } from 'node:stream';
import { Injectable } from '@nestjs/common';
import sax from 'sax';
import { DEFAULT_CATEGORY_NAME } from '../repositories/category.constants';

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
