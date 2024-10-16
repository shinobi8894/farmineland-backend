import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateCharacterDto {
  @IsNotEmpty({ message: 'landcoins_balance require' })
  @ApiProperty()
  landcoins_balance: number;
}
