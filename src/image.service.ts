import crypto from 'node:crypto';
import { EntityManager } from '@mikro-orm/core';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import fetch, { HeaderInit } from 'node-fetch';
import Parser from 'rss-parser';
import { FeedEntity, ImageEntity } from './entities';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(private readonly em: EntityManager) {}

  async downloadFeedImage(feed: FeedEntity): Promise<ImageEntity | null> {
    let image: ImageEntity | undefined;
    {
      const feedImage = await this.downloadImageFromFeed(feed);
      if (!image && feedImage) {
        this.logger.debug(`Downloaded image from feed ${feed.id}: ${feedImage.id}`);
        image = feedImage;
      }
    }
    {
      const favicon = await this.downloadFavicon(feed);
      if (!image && favicon) {
        this.logger.debug(`Downloaded favicon for feed ${feed.id}: ${favicon.id}`);
        image = favicon;
      }
    }

    if (image) {
      feed.image = image;
      await this.em.persistAndFlush(feed);
      return image;
    }

    this.logger.debug(`No image found in feed ${feed.id}, trying favicon`);
    return null;
  }

  async downloadFavicon(feed: FeedEntity): Promise<ImageEntity | null> {
    if (!feed.link) {
      this.logger.warn(`Feed ${feed.id} has no link, cannot download favicon`);
      return null;
    }

    this.logger.debug(`Downloading favicon for feed ${feed.id} from ${feed.link}`);

    const url = new URL('/favicon.ico', feed.link);
    try {
      {
        const favicon = await this.downloadImage(url);
        if (favicon) return favicon;
      }
      {
        const favicon = await this.searchAndDownloadFavicon(feed);
        if (favicon) return favicon;
      }
      return null;
    } catch (error_) {
      const error = error_ as Error;
      this.logger.error(`Failed to download favicon ${url}: ${error.message}`, error.stack);
      return null;
    }
  }

  async searchAndDownloadFavicon(feed: FeedEntity): Promise<ImageEntity | null> {
    if (!feed.link) {
      this.logger.warn(`Feed ${feed.id} has no link, cannot download favicon from link`);
      return null;
    }

    this.logger.debug(`Searching for favicon in website content for feed ${feed.id} from ${feed.link}`);

    try {
      const url = new URL(feed.link);

      const response = await fetch(url, { redirect: 'follow' });
      if (!response.ok) {
        this.logger.warn(`Failed to download website content for favicon ${feed.link}: ${response.statusText}`);
        return null;
      }

      const parsed = cheerio.load(await response.text());
      const iconLink = parsed('link[rel="icon"]').attr('href') || parsed('link[rel="shortcut icon"]').attr('href');
      if (!iconLink) {
        this.logger.warn(`No favicon link found in website content for ${feed.link}`);
        return null;
      }

      const fullIconLink = new URL(iconLink, url);
      this.logger.debug(`Found favicon link: ${fullIconLink}`);

      return await this.downloadImage(fullIconLink);
    } catch (error_) {
      const error = error_ as Error;
      this.logger.error(`Failed to download favicon from link ${feed.link}: ${error.message}`, error.stack);
      return null;
    }
  }

  async downloadImageFromFeed(feed: FeedEntity): Promise<ImageEntity | null> {
    try {
      this.logger.debug(`Downloading image from feed content for feed ${feed.id}`);

      const parser = new Parser();

      const response = await fetch(feed.url, { redirect: 'follow' });
      if (!response.ok) {
        this.logger.warn(`Failed to fetch feed content for feed ${feed.id}: ${response.statusText}`);
        return null;
      }

      const parsed = await parser.parseString(await response.text());

      const baseUrl = parsed.link || feed.link;
      if (!baseUrl) {
        this.logger.warn(`Feed ${feed.id} has no link, cannot resolve image URL`);
        return null;
      }

      if (parsed.image && parsed.image.url) {
        const imageUrl = new URL(parsed.image.url, baseUrl);
        return this.downloadImage(imageUrl);
      }

      this.logger.warn(`No image found in feed content for feed ${feed.id}`);
      return null;
    } catch (error_) {
      const error = error_ as Error;
      this.logger.error(
        `Failed to download image from feed content for feed ${feed.id}: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  async downloadImage(url: URL): Promise<ImageEntity | null> {
    try {
      const em = this.em.fork();

      const headers: HeaderInit = {};

      const existing = await em.findOne(ImageEntity, { url: String(url) });
      if (existing?.etag) {
        this.logger.debug(`Set ETag for ${url}: ${existing.etag}`);
        headers['If-None-Match'] = existing.etag;
      }
      if (existing?.lastModified) {
        this.logger.debug(`Set Last-Modified for ${url}: ${existing.lastModified}`);
        headers['If-Modified-Since'] = existing.lastModified;
      }

      const response = await fetch(url, { redirect: 'follow', headers });
      if (response.status === Number(HttpStatus.NOT_MODIFIED)) {
        const etag = response.headers.get('etag');
        const lastModified = response.headers.get('last-modified');
        this.logger.debug(
          `Image ${url} not modified, using existing image. ETag: ${etag}, Last-Modified: ${lastModified}`,
        );
        return existing;
      }
      if (!response.ok) {
        this.logger.warn(`Failed to download image ${url}: ${response.statusText}`);
        return null;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        this.logger.warn(`Invalid content type for image ${url}: ${contentType}`);
        return null;
      }

      const blob = Buffer.from(await response.arrayBuffer());
      const sha256sum = crypto.createHash('sha256').update(blob).digest('hex');
      const sameSha256sum = await em.findOne(ImageEntity, { sha256sum });
      if (sameSha256sum) {
        this.logger.debug(`Image ${url} already exists with same SHA256 sum: ${sha256sum}`);
        return sameSha256sum;
      }

      this.logger.debug(`Downloaded image ${url} with content type ${contentType}`);
      const image = em.create(ImageEntity, {
        url: response.url,
        contentType,
        blob,
        etag: response.headers.get('etag'),
        lastModified: response.headers.get('last-modified'),
      });
      em.persist(image);

      await em.flush();
      return image;
    } catch (error_) {
      const error = error_ as Error;
      this.logger.error(`Failed to download image ${url}: ${error.message}`, error.stack);
      return null;
    }
  }
}
