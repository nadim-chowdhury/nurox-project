import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Seeder');

  // Tenant ID is required — pass as CLI argument:
  // pnpm --filter api seed -- <tenant-uuid>
  const tenantId = process.argv[2];
  if (!tenantId) {
    logger.error(
      'Usage: pnpm --filter api seed -- <tenant-uuid>\n' +
        'A tenant ID is required to scope seed data correctly.',
    );
    process.exit(1);
  }

  try {
    logger.log('Initializing Standalone Seed Application Context...');
    const app = await NestFactory.createApplicationContext(SeedModule);

    // Execute Seeding for the given tenant
    const seedService = app.get(SeedService);
    await seedService.seedAll(tenantId);

    logger.log('Closing Application Context...');
    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('Seeding process failed', error);
    process.exit(1);
  }
}

void bootstrap();
