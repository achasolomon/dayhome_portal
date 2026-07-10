import { VersioningType, ValidationPipe } from '@nestjs/common';
import type { RequestHandler } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { register } from 'prom-client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/api/v1/admin/queues');

  const emailQueue = app.get<Queue>(getQueueToken('email'));
  const deadLetterQueue = app.get<Queue>(getQueueToken('dead-letter'));

  createBullBoard({
    queues: [new BullMQAdapter(emailQueue), new BullMQAdapter(deadLetterQueue)],
    serverAdapter,
  });

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.use(
    '/api/v1/admin/queues',
    serverAdapter.getRouter() as RequestHandler,
  );

  app.setGlobalPrefix('api', { exclude: ['/metrics'] });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  app.useLogger(app.get(Logger));

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('SPICED Dayhome API')
    .setDescription(
      'API documentation for the SPICED Dayhome Management Platform',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/v1/docs', app, document);

  const port = process.env.PORT || 4000;

  // Raw Express route for Prometheus scraper (bypasses NestJS prefix/versioning)
  const expressApp = app
    .getHttpAdapter()
    .getInstance() as import('express').Express;
  expressApp.get(
    '/metrics',
    async (
      _req: import('express').Request,
      res: import('express').Response,
    ) => {
      res.setHeader('Content-Type', register.contentType);
      res.end(await register.metrics());
    },
  );

  await app.listen(port);

  app.get(Logger).log(`App is running on http://localhost:${port}`);
}

void bootstrap();
