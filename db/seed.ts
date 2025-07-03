import { MikroORM } from '@mikro-orm/core';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from '../src/seed.module';
import { SeedService } from '../src/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(SeedModule);
  await app.init();

  await app.get(MikroORM).getSchemaGenerator().ensureDatabase();
  await app.get(MikroORM).getSchemaGenerator().updateSchema();

  const seedService = app.get<SeedService>(SeedService);
  await seedService.seed();

  await app.close();
}

bootstrap().catch(console.error);
