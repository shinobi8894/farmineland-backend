import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import { join } from 'path';
import { useContainer } from 'class-validator';
import { BigIntToNumberInterceptor } from './validators/BigInt.validator';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle("Farmine API's")
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
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
