import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, Validate } from 'class-validator';
import { IsUnique } from 'src/validators/IsUnique.validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Preencha o nome' })
  @ApiProperty()
  @MaxLength(255, { message: 'Tamanho máximo é de 255 caracteres ' })
  @Validate(IsUnique, ['account', 'name'])
  name: string;

  @IsEmail(undefined, { message: 'Informe um e-mail válido' })
  @IsNotEmpty({ message: 'Preencha o email' })
  @ApiProperty()
  @MaxLength(255, { message: 'Tamanho máximo é de 255 caracteres ' })
  @Validate(IsUnique, ['account', 'email'])
  email: string;

  @IsNotEmpty({ message: 'Preencha a senha' })
  @ApiProperty()
  @MaxLength(255, { message: 'Tamanho máximo é de 255 caracteres ' })
  password: string;
}
