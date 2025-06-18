import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  {
    const options: SwaggerDocumentOptions = {
      autoTagControllers: true,
    };
    const config = new DocumentBuilder()
      .setTitle('id-reader')
      .setDescription('The id-reader API')
      .setVersion('0.0.0-dev')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config, options);
    SwaggerModule.setup('api', app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
