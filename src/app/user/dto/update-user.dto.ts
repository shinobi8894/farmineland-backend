import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNotEmpty({ message: 'Preencha o nome' })
  @ApiProperty()
  @MaxLength(255, { message: 'Tamanho máximo é de 255 caracteres ' })
  name: string;
}
