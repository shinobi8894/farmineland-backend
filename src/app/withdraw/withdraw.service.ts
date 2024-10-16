import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from '../user/user.service';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';

@Injectable()
export class WithdrawService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async createNew(data: CreateWithdrawDto) {
    // Check if the user is authenticated and authorized
    console.log('data', data);
    const user = await this.userService.findOneById(data.account_id);
    if (!user) {
      throw new BadRequestException('User not found or not authenticated');
    }

    try {
      return await this.prisma.withdraw.create({
        data: {
          player_id: data.player_id,
          account_id : data.account_id,
          withdraw_funds : data.withdraw_funds
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to create withdraw');
    }
  }
}
