import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(path.join(__dirname, 'public'));
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", 'ws:'],
          connectSrc: ["'self'", 'ws:'],
        },
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch(console.error);
