import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, Validate } from 'class-validator';

export class RaffleDto {
  @IsNotEmpty({ message: 'Preencha o tamanho' })
  @ApiProperty()
  @MaxLength(255, { message: 'Tamanho máximo é de 255 caracteres ' })
  uriToken: string;

  @IsNotEmpty({ message: 'Preencha o tamanho' })
  @ApiProperty()
  @MaxLength(255, { message: 'Tamanho máximo é de 255 caracteres ' })
  address: string;
}
