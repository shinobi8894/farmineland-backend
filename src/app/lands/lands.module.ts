import { Module } from '@nestjs/common';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';
import { PrismaService } from 'src/database/prisma.service';
import { UploadService } from '../upload/upload.service';

@Module({
  controllers: [LandsController],
  providers: [LandsService, PrismaService, UploadService],
})
export class LandsModule {}
