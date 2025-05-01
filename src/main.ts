import path from 'node:path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableShutdownHooks();
  app.useStaticAssets(path.join(__dirname, 'public'));

  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'", 'ws:'],
          connectSrc: ["'self'", 'ws:'],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://unpkg.com'],
        },
      },
    }),
  );

  {
    const config = new DocumentBuilder()
      .setTitle('id reader')
      .setDescription('A RSS reader')
      .setVersion('0.0.0-dev')
      .build();
    const options: SwaggerDocumentOptions = { autoTagControllers: true };
    const documentFactory = () => SwaggerModule.createDocument(app, config, options);
    SwaggerModule.setup('api', app, documentFactory);
  }
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch(console.error);
