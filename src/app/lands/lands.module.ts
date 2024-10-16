import { Module } from '@nestjs/common';
import { LandsService } from './lands.service';
import { LandsController } from './lands.controller';
import { PrismaService } from 'src/database/prisma.service';
import { UploadService } from '../upload/upload.service';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [LandsController],
  providers: [LandsService, PrismaService, UploadService],
  imports: [UserModule],
})
export class LandsModule {}
