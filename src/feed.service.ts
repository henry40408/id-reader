import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import { add, sub } from 'date-fns';
import fetch from 'node-fetch';
import Parser from 'rss-parser';
import { AppConfigService } from './app-config.module';
import { EntryEntity, FeedEntity, JobLogEntity } from './entities';
import { convertDate } from './utility';

export const FEED_FETCH_ENTRIES = 'feed:fetch_entries';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    private readonly configService: AppConfigService,
    private readonly em: EntityManager,
  ) {}

  async fetchEntries(userId: number, seconds: number): Promise<void> {
    const em = this.em.fork();

    const now = new Date();
    const pivot = sub(now, { seconds });

    const feeds = await em.find(FeedEntity, { user: userId });
    const feedIds = feeds.map((feed) => String(feed.id));
    const jobLogs = await em.find(JobLogEntity, {
      name: FEED_FETCH_ENTRIES,
      externalId: { $in: feedIds },
      createdAt: { $gte: pivot },
    });

    const promises: Promise<void>[] = [];
    for (const feed of feeds) {
      const found = jobLogs.find((log) => log.externalId === String(feed.id));
      if (found) {
        const nextRun = add(found.createdAt, { seconds });
        this.logger.debug(
          `Skipping feed ${feed.id} as it has already been processed recently. It will be processed again at ${nextRun.toISOString()}.`,
        );
        continue;
      }
      const task = async () => {
        try {
          this.logger.debug(`Fetching entries for feed ${feed.id}`);
          await this.fetchFeedEntries(feed);

          this.logger.debug(`Entries fetched for feed ${feed.id}`);

          const jobLog = em.create(JobLogEntity, {
            name: FEED_FETCH_ENTRIES,
            externalId: String(feed.id),
            status: 'ok',
            payload: { type: 'ok', result: {} },
          });
          await em.upsert(JobLogEntity, jobLog, { onConflictAction: 'merge' });
        } catch (error_) {
          const error = error_ as Error;
          this.logger.error(`Failed to fetch entries for feed ${feed.id}: ${error.message}`, error.stack);

          const jobLog = em.create(JobLogEntity, {
            name: FEED_FETCH_ENTRIES,
            externalId: String(feed.id),
            status: 'err',
            payload: { type: 'err', error: error.message },
          });
          await em.upsert(JobLogEntity, jobLog, { onConflictAction: 'merge' });
        }
      };
      promises.push(task());
    }
    await Promise.all(promises);
    await em.flush();
  }

  async fetchFeedEntries(feed: FeedEntity) {
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
