import { NestFactory } from '@nestjs/core';
import { SeedModule } from '../src/seed.module';
import { SeedService } from '../src/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(SeedModule);
  await app.init();

  const seedService = app.get<SeedService>(SeedService);
  await seedService.seed();

  await app.close();
}

bootstrap().catch(console.error);
