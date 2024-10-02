import { Module } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CharacterController } from './character.controller';
import { PrismaService } from 'src/database/prisma.service';
import { IsUnique } from 'src/validators/IsUnique.validator';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [CharacterController],
  imports: [UserModule],
  providers: [CharacterService, UserService, PrismaService, IsUnique],
  exports: [CharacterService],
})
export class CharacterModule {}
