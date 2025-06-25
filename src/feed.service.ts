import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';
import Parser from 'rss-parser';
import { AppConfigService } from './app-config.module';
import { EntryEntity, FeedEntity } from './entities';
import { convertDate } from './utility';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    private readonly configService: AppConfigService,
    private readonly em: EntityManager,
  ) {}

  async fetchEntries(feed: FeedEntity) {
    const em = this.em.fork();

    const res = await fetch(feed.url, {
      redirect: 'follow',
      headers: { 'User-Agent': this.configService.config.userAgent },
    });
    if (!res.ok) throw new Error(`Failed to fetch feed ${feed.id} (${feed.url}): ${res.status} ${res.statusText})`);

    const parser = new Parser({
      xml2js: {
        valueProcessors: [
          (value: string, name: string): string => {
            name = name.toLowerCase();
            if (['pubdate', 'dc:date'].includes(name)) return convertDate(value);
            return value;
          },
        ],
      },
    });
    const parsed: Parser.Output<Parser.Item> = await parser.parseString(await res.text());
    for (const entry of parsed.items) {
      if (!entry.title) {
        this.logger.warn(`Entry with no title found in feed ${feed.id}, skipping`);
        continue;
      }
      if (!entry.isoDate) {
        this.logger.warn(`Entry ${entry.title} has no ISO date, skipping`);
        continue;
      }

      const entity = new EntryEntity();
      entity.guid = entry.guid || entry.link || '';
      entity.title = entry.title;
      entity.isoDate = new Date(entry.isoDate);
      entity.content = entry.content;
      entity.summary = entry.summary || '';
      entity.link = entry.link;
      entity.creator = entry.creator;
      entity.categories = entry.categories || [];
      entity.user = feed.user;
      entity.feed = feed;

      await em.upsert(EntryEntity, entity, { onConflictAction: 'merge' });
    }

    await em.flush();
  }
}
