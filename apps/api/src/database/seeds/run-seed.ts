import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Seeder');

  try {
    logger.log('Initializing Standalone Seed Application Context...');
    const app = await NestFactory.createApplicationContext(SeedModule);

    // Execute Seeding
    const seedService = app.get(SeedService);
    await seedService.seedAll();

    logger.log('Closing Application Context...');
    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding process failed', error);
    process.exit(1);
  }
}

void bootstrap();
