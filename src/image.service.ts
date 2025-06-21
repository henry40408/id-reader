import { EntityManager } from '@mikro-orm/core';
import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';
import Parser from 'rss-parser';
import { FeedEntity, ImageEntity } from './entities';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(private readonly em: EntityManager) {}

  async downloadFeedImage(feed: FeedEntity): Promise<ImageEntity | undefined> {
    {
      const image = await this.downloadImageFromFeed(feed);
      if (image) {
        this.logger.debug(`Downloaded image from feed ${feed.id}: ${image.id}`);
        return image;
      }
    }
    {
      const favicon = await this.downloadFavicon(feed);
      if (favicon) {
        this.logger.debug(`Downloaded favicon for feed ${feed.id}: ${favicon.id}`);
        return favicon;
      }
    }
    this.logger.debug(`No image found in feed ${feed.id}, trying favicon.`);
    return undefined;
  }

  async downloadFavicon(feed: FeedEntity): Promise<ImageEntity | undefined> {
    if (!feed.link) {
      this.logger.warn(`Feed ${feed.id} has no link, cannot download favicon.`);
      return undefined;
    }

    const url = new URL('/favicon.ico', feed.link);
    try {
      return this.downloadImage(url);
    } catch (error_) {
      const error = error_ as Error;
      this.logger.error(`Failed to download favicon ${url}: ${error.message}`, error.stack);
      return undefined;
    }
  }

  async downloadImageFromFeed(feed: FeedEntity): Promise<ImageEntity | undefined> {
    try {
      const parser = new Parser();

      const response = await fetch(feed.url, { redirect: 'follow' });
      if (!response.ok) {
        this.logger.warn(`Failed to fetch feed content for feed ${feed.id}: ${response.statusText}`);
        return undefined;
      }

      const parsed = await parser.parseString(await response.text());

      const baseUrl = parsed.link || feed.link;
      if (!baseUrl) {
        this.logger.warn(`Feed ${feed.id} has no link, cannot resolve image URL.`);
        return undefined;
      }

      if (parsed.image && parsed.image.url) {
        const imageUrl = new URL(parsed.image.url, baseUrl);
        return this.downloadImage(imageUrl);
      }

      this.logger.warn(`No image found in feed content for feed ${feed.id}`);
      return undefined;
    } catch (error_) {
      const error = error_ as Error;
      this.logger.error(
        `Failed to download image from feed content for feed ${feed.id}: ${error.message}`,
        error.stack,
      );
      return undefined;
    }
  }

  async downloadImage(url: URL): Promise<ImageEntity | undefined> {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (!response.ok) {
        this.logger.warn(`Failed to download image ${url}: ${response.statusText}`);
        return undefined;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        this.logger.warn(`Invalid content type for image ${url}: ${contentType}`);
        return undefined;
      }

      const image = this.em.create(ImageEntity, {
        url: response.url,
        contentType,
        blob: Buffer.from(await response.arrayBuffer()),
      });
      await this.em.persist(image).flush();
      return image;
    } catch (error_) {
      const error = error_ as Error;
      this.logger.error(`Failed to download image ${url}: ${error.message}`, error.stack);
      return undefined;
    }
  }
}
