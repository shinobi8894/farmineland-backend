import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  enableShutDownHooks(app: NestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
