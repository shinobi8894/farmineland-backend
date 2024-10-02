import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'Preencha o name' })
  @ApiProperty()
  @MaxLength(255, { message: 'Tamanho máximo é de 255 caracteres ' })
  name: string;

  @IsNotEmpty({ message: 'Preencha a senha' })
  @ApiProperty()
  @MaxLength(255, { message: 'Tamanho máximo é de 255 caracteres ' })
  password: string;
}
