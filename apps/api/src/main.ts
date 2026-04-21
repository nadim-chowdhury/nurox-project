import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', 3001);
  const corsOrigin = config.get<string>(
    'app.corsOrigin',
    'http://localhost:3000',
  );

  app.setGlobalPrefix('api');

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: corsOrigin,
    credentials: true, // required for httpOnly cookies
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
  });

  if (config.get<string>('app.nodeEnv') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Nurox ERP API')
      .setDescription('Nurox ERP backend API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
  console.log(`🚀 Nurox API running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}
void bootstrap();
