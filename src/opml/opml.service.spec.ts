import * as fs from 'node:fs';
import * as path from 'node:path';
import { Readable } from 'node:stream';
import { OpmlService } from './opml.service';
import { DEFAULT_CATEGORY_NAME } from 'src/repositories/category.constants';

describe('OpmlService', () => {
  let service: OpmlService;

  beforeEach(() => {
    service = new OpmlService();
  });

  it('should parse OPML file', async () => {
    const readable = fs.createReadStream(path.join(__dirname, 'test.opml'));
    const opml = await service.parseOPML(readable);
    expect(opml).toEqual([
      {
        name: 'Test Category',
        feeds: [
          {
            title: 'Test Feed',
            htmlUrl: 'http://test.invalid',
            xmlUrl: 'http://test.invalid/feed',
          },
          {
            title: 'Test Feed 2',
            htmlUrl: 'http://blog.test.invalid',
            xmlUrl: 'http://blog.test.invalid/feed',
          },
        ],
      },
    ]);
  });

  it('should throw an error if the OPML file is invalid', async () => {
    const readable = new Readable();
    readable.push('invalid');
    readable.push(null);
    await expect(service.parseOPML(readable)).rejects.toThrow('Non-whitespace before first tag.');
  });

  it('should parse OPML file with no category', async () => {
    const readable = fs.createReadStream(path.join(__dirname, 'no-category.opml'));
    const opml = await service.parseOPML(readable);
    expect(opml).toEqual([
      {
        name: DEFAULT_CATEGORY_NAME,
        feeds: [
          {
            title: 'Test Feed',
            htmlUrl: 'http://test.invalid',
            xmlUrl: 'http://test.invalid/feed',
          },
          {
            title: 'Test Feed 2',
            htmlUrl: 'http://blog.test.invalid',
            xmlUrl: 'http://blog.test.invalid/feed',
          },
        ],
      },
    ]);
  });
});
