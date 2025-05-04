import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableShutdownHooks();
  app.use(helmet());
  {
    const config = new DocumentBuilder()
      .setTitle('id-reader')
      .setDescription('A RSS reader')
      .setVersion('0.0.0-dev')
      .build();
    const options: SwaggerDocumentOptions = {
      autoTagControllers: true,
    };
    const document = SwaggerModule.createDocument(app, config, options);
    SwaggerModule.setup('api', app, document);
  }
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
