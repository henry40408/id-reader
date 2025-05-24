import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Feed, Image } from 'knex/types/tables';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { Cache, createCache } from 'cache-manager';
import { ImageRepository } from './repository/image.repository';
import { KnexService } from './knex.service';
import { CreateFeed } from './repository/feed.repository';

export type FoundFeed = Omit<CreateFeed, 'category_id' | 'user_id'>;

@Injectable()
export class FeedMetadataService {
  private readonly logger = new Logger(FeedMetadataService.name);

  private readonly feedParser = new Parser();

  constructor(
    private readonly knexService: KnexService,
    private readonly imageRepository: ImageRepository,
  ) {}

  async findFeed(url: string): Promise<FoundFeed | undefined> {
    const cache = createCache();

    const feed = await this.tryParseFeed(cache, url);
    if (feed) {
      this.logger.debug(`${url} is a feed`);
      return feed;
    }

    const canonical = await this.getCanonicalURL(cache, url);
    const alternate = await this.getAlternateURL(cache, canonical);
    if (alternate) {
      const feed = await this.tryParseFeed(cache, alternate, url);
      if (feed) {
        this.logger.debug(`${url} is a webpage and ${alternate} is a feed`);
        return feed;
      }
    }
  }

  async updateFeedImage(feedId: number): Promise<Image | null> {
    this.logger.log(`Update image of feed ${feedId}`);

    const cache = createCache();

    const feed = await this.knexService.connection('feeds').where('id', feedId).first();
    if (!feed) throw new NotFoundException('Feed not found');

    {
      const image = await this.findImageFromFeed(cache, feedId, feed.xml_url);
      if (image) {
        this.logger.log(`Attached image to feed ${feedId} from feed`);
        return image;
      }
    }
    {
      const image = await this.findImageFromAlternate(cache, feed);
      if (image) {
        this.logger.log(`Attached image to feed ${feedId} from alternate`);
        return image;
      }
    }
    {
      const image = await this.findImageFromFavIcon(cache, feed);
      if (image) {
        this.logger.log(`Attached favicon to feed ${feedId}`);
        return image;
      }
    }

    this.logger.warn(`No image found for feed ${feedId}`);
    return null;
  }

  private async attachImageToFeed(feedId: number, imageUrl: string): Promise<Image> {
    const image = await this.imageRepository.create(imageUrl);
    await this.knexService.connection('feeds_composite').where('id', feedId).from('feeds').update({
      image_id: image.id,
    });
    return image;
  }

  private async fetch(cache: Cache, url: string): Promise<string | null> {
    const key = `feed-metadata:content:${url}`;
    return await cache.wrap(key, async () => {
      try {
        const resp = await fetch(url);
        if (!resp.ok) return null;
        return await resp.text();
      } catch (e) {
        const err = e as Error;
        this.logger.error(err.message, err.stack, `Failed to fetch content of ${url}`);
        throw err;
      }
    });
  }

  private async findImageFromAlternate(cache: Cache, feed: Feed): Promise<Image | null> {
    if (!feed.html_url) return null;

    const canonical = await this.getCanonicalURL(cache, feed.html_url);

    const alternate = await this.getAlternateURL(cache, canonical);
    if (!alternate) return null;

    const parsed = new URL(alternate);
    if (!parsed.protocol.startsWith('http')) {
      this.logger.warn(`Alternate URL ${alternate} is not http`);
      return null;
    }

    return this.findImageFromFeed(cache, feed.id, String(new URL(alternate, canonical)));
  }

  private async findImageFromFavIcon(cache: Cache, feed: Feed): Promise<Image | null> {
    if (!feed.html_url) return null;

    const canonical = await this.getCanonicalURL(cache, feed.html_url);
    const content = await this.fetch(cache, canonical);
    if (!content) {
      this.logger.error(`Failed to fetch content of ${canonical}`);
      return null;
    }

    const parsed = cheerio.load(content);

    const appleTouchIcon = parsed('link[rel="apple-touch-icon"]').attr('href');
    if (appleTouchIcon) {
      this.logger.debug(`Found Apple touch icon in feed ${feed.id}: ${appleTouchIcon}`);
      return this.attachImageToFeed(feed.id, String(new URL(appleTouchIcon, canonical)));
    }

    const favicon = parsed('link[rel="icon"]').attr('href');
    if (favicon) {
      this.logger.debug(`Found favicon in feed ${feed.id}: ${favicon}`);
      return this.attachImageToFeed(feed.id, String(new URL(favicon, canonical)));
    }

    const shortcutIcon = parsed('link[rel="shortcut icon"]').attr('href');
    if (shortcutIcon) {
      this.logger.debug(`Found shortcut icon in feed ${feed.id}: ${shortcutIcon}`);
      return this.attachImageToFeed(feed.id, String(new URL(shortcutIcon, canonical)));
    }

    return null;
  }

  private async findImageFromFeed(cache: Cache, feedId: number, xmlUrl: string): Promise<Image | null> {
    this.logger.debug(`Fetching image from feed ${feedId}: ${xmlUrl}`);

    const content = await this.fetch(cache, xmlUrl);
    if (!content) {
      this.logger.error(`Failed to fetch content of ${xmlUrl}`);
      return null;
    }

    const parsed = await this.feedParser.parseString(content);
    if (!parsed.image?.url) {
      this.logger.warn(`No image found in feed ${feedId}: ${xmlUrl}`);
      return null;
    }

    this.logger.debug(`Found image in feed ${feedId}: ${parsed.image.url}`);
    return this.attachImageToFeed(feedId, String(new URL(parsed.image.url, xmlUrl)));
  }

  private async getAlternateURL(cache: Cache, htmlUrl: string): Promise<string | undefined> {
    this.logger.debug(`Fetching alternate URL in ${htmlUrl}`);

    const content = await this.fetch(cache, htmlUrl);
    if (!content) {
      this.logger.error(`Failed to fetch content of ${htmlUrl}`);
      return undefined;
    }

    const parsed = cheerio.load(content);

    const rss = parsed('link[type="application/rss+xml"]').attr('href');
    if (rss) {
      const url = String(new URL(rss, htmlUrl));
      this.logger.debug(`Found RSS URL in ${url}`);
      return url;
    }

    const atom = parsed('link[type="application/atom+xml"]').attr('href');
    if (atom) {
      const url = String(new URL(atom, htmlUrl));
      this.logger.debug(`Found Atom URL in ${url}`);
      return url;
    }

    return undefined;
  }

  private async getCanonicalURL(cache: Cache, htmlUrl: string): Promise<string> {
    const content = await this.fetch(cache, htmlUrl);
    if (!content) {
      this.logger.error(`Failed to fetch content of ${htmlUrl}`);
      return htmlUrl;
    }

    const parsed = cheerio.load(content);

    const canonical = parsed('link[rel="canonical"]').attr('href');
    if (canonical) {
      this.logger.debug(`Found canonical URL in ${canonical}`);
      return String(new URL(canonical, htmlUrl));
    }
    return htmlUrl;
  }

  private async safeParseString(content: string): Promise<Parser.Output<Parser.Item> | undefined> {
    try {
      return await this.feedParser.parseString(content);
    } catch {
      // empty
    }
  }

  private async tryParseFeed(cache: Cache, feedUrl: string, htmlUrl?: string): Promise<FoundFeed | undefined> {
    const content = await this.fetch(cache, feedUrl);
    if (!content) return undefined;

    const parsed = await this.safeParseString(content);
    if (parsed && parsed.title) {
      return {
        html_url: parsed.link ?? htmlUrl,
        xml_url: feedUrl,
        title: parsed.title,
      };
    }
  }
}
