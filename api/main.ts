import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use(helmet());

  {
    const config = new DocumentBuilder()
      .setTitle('id reader')
      .setDescription('A RSS reader')
      .setVersion('0.0.0-dev')
      .build();
    const options: SwaggerDocumentOptions = {
      autoTagControllers: true,
    };
    const documentFactory = () => SwaggerModule.createDocument(app, config, options);
    SwaggerModule.setup('api', app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
