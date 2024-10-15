import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import { join } from 'path';
import { useContainer } from 'class-validator';
import { BigIntToNumberInterceptor } from './validators/BigInt.validator';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security: Set security headers
  // app.use(helmet());

  // Security: Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  });
  app.use(limiter);

  app.enableCors();
  // app.enableCors({
  //   origin: ['*'], // Specify allowed origins
  //   methods: 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
  //   allowedHeaders: 'Content-Type, Authorization',
  //   credentials: true,
  // });

  const config = new DocumentBuilder()
    .setTitle("Farmine API's")
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Body parser limits
  app.use(bodyParser.json({ limit: '1mb' })); // Reduced limit for security
  app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

  // Serve static assets securely
  app.useStaticAssets(join(__dirname, '..', 'metadata'), {
    prefix: '/metadata/',
  });

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalInterceptors(new BigIntToNumberInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, forbidNonWhitelisted: true }),
  );

  await app.listen(3333);
}
bootstrap();
