import { Module } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { IsUnique } from 'src/validators/IsUnique.validator';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { WithdrawController } from './withdraw.controller';
import { WithdrawService } from './withdraw.service';
import { CharacterModule } from '../character/character.module';

@Module({
  controllers: [WithdrawController],
  imports: [UserModule, CharacterModule],
  providers: [WithdrawService, UserService, PrismaService, IsUnique],
  exports: [WithdrawService],
})
export class WithdrawModule {}
