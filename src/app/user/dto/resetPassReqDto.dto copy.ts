import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class ResetPassReqDto {
  @IsNotEmpty({ message: 'Preencha o email' })
  @ApiProperty()
  @MaxLength(255, { message: 'Tamanho máximo é de 255 caracteres ' })
  email: string;
  
  @IsNotEmpty({ message: 'Preencha o link' })
  @ApiProperty()
  @MaxLength(255, { message: 'Tamanho máximo é de 255 caracteres ' })
  redirect_link: string;
}

export class ResetPassDto {
  @ApiProperty({ type: 'string' })
  token: string;

  @ApiProperty({ type: 'string' })
  newPassword: string;
}
