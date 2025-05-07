import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Knex } from 'knex';
import { Feed } from 'knex/types/tables';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { Cache, createCache } from 'cache-manager';
import { KNEX } from '../knex/knex.constant';
import { ImageRepository } from '../repository/repository/image.repository';

@Injectable()
export class FeedMetadataService {
  private readonly logger = new Logger(FeedMetadataService.name);

  constructor(
    @Inject(KNEX) private readonly knex: Knex,
    private readonly imageRepository: ImageRepository,
  ) {}

  async updateFeedImage(feedId: number): Promise<boolean> {
    const cache = createCache();

    const feed = await this.knex('feeds').where('id', feedId).first();
    if (!feed) throw new NotFoundException('Feed not found');
    if (feed.image_id) return true;

    {
      const done = await this.findImageFromFeed(cache, feedId, feed.xml_url);
      if (done) {
        this.logger.log(`Attached image to feed ${feedId} from feed`);
        return true;
      }
    }
    {
      const done = await this.findImageFromAlternate(cache, feed);
      if (done) {
        this.logger.log(`Attached image to feed ${feedId} from alternate`);
        return true;
      }
    }
    {
      const done = await this.findImageFromFavIcon(cache, feed);
      if (done) {
        this.logger.log(`Attached favicon to feed ${feedId}`);
        return true;
      }
    }
    return false;
  }

  private async attachImageToFeed(feedId: number, imageUrl: string): Promise<boolean> {
    const image = await this.imageRepository.create(imageUrl);
    await this.knex('feeds_composite').where('id', feedId).from('feeds').update({
      image_id: image.id,
    });
    return true;
  }

  private async fetch(cache: Cache, feedId: number, url: string): Promise<string | null> {
    const key = `feed-metadata:content:${feedId}:${url}`;
    return await cache.wrap(key, async () => {
      const resp = await fetch(url);
      if (!resp.ok) return null;
      return await resp.text();
    });
  }

  private async findImageFromAlternate(cache: Cache, feed: Feed): Promise<boolean> {
    if (!feed.html_url) return false;

    const canonical = await this.getCanonicalURL(cache, feed.id, feed.html_url);

    const alternate = await this.getAlternateURL(cache, feed.id, canonical);
    if (!alternate) return false;

    return this.findImageFromFeed(cache, feed.id, String(new URL(alternate, canonical)));
  }

  private async findImageFromFavIcon(cache: Cache, feed: Feed): Promise<boolean> {
    if (!feed.html_url) return false;

    const canonical = await this.getCanonicalURL(cache, feed.id, feed.html_url);
    const content = await this.fetch(cache, feed.id, canonical);
    if (!content) {
      this.logger.error(`Failed to fetch content of ${canonical}`);
      return false;
    }

    const parsed = cheerio.load(content);

    const appleTouchIcon = parsed('link[rel="apple-touch-icon"]').attr('href');
    if (appleTouchIcon) {
      return this.attachImageToFeed(feed.id, String(new URL(appleTouchIcon, canonical)));
    }

    const favicon = parsed('link[rel="icon"]').attr('href');
    if (favicon) return this.attachImageToFeed(feed.id, String(new URL(favicon, canonical)));

    return false;
  }

  private async findImageFromFeed(cache: Cache, feedId: number, xmlUrl: string): Promise<boolean> {
    const content = await this.fetch(cache, feedId, xmlUrl);
    if (!content) {
      this.logger.error(`Failed to fetch content of ${xmlUrl}`);
      return false;
    }

    const parser = new Parser();

    const parsed = await parser.parseString(content);
    if (!parsed.image?.url) return false;

    return this.attachImageToFeed(feedId, String(new URL(parsed.image.url, xmlUrl)));
  }

  private async getAlternateURL(cache: Cache, feedId: number, htmlUrl: string): Promise<string | undefined> {
    const content = await this.fetch(cache, feedId, htmlUrl);
    if (!content) {
      this.logger.error(`Failed to fetch content of ${htmlUrl}`);
      return undefined;
    }

    const parsed = cheerio.load(content);

    const rss = parsed('link[type="application/rss+xml"]').attr('href');
    if (rss) return String(new URL(rss, htmlUrl));

    const atom = parsed('link[type="application/atom+xml"]').attr('href');
    if (atom) return String(new URL(atom, htmlUrl));

    return undefined;
  }

  private async getCanonicalURL(cache: Cache, feedId: number, htmlUrl: string): Promise<string> {
    const content = await this.fetch(cache, feedId, htmlUrl);
    if (!content) {
      this.logger.error(`Failed to fetch content of ${htmlUrl}`);
      return htmlUrl;
    }

    const parsed = cheerio.load(content);

    const canonical = parsed('link[rel="canonical"]').attr('href');
    if (canonical) return String(new URL(canonical, htmlUrl));

    return htmlUrl;
  }
}
