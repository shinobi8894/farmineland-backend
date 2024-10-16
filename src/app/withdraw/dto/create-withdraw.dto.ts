import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateWithdrawDto {

  @IsNotEmpty({ message: 'withdraw is required' })
  @ApiProperty()
  withdraw_funds: number;

  @IsNotEmpty({ message: 'account id is required' })
  @ApiProperty()
  account_id: number;

  @IsNotEmpty({ message: 'player id is required' })
  @ApiProperty()
  player_id: number;
}
