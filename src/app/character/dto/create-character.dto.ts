import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength, Validate } from "class-validator";
import { IsUnique } from "src/validators/IsUnique.validator";

export class CreateCharacterDto {
  @IsNotEmpty({ message: 'Preencha o nome' })
  @ApiProperty()
  @MaxLength(255, { message: 'Tamanho máximo é de 255 caracteres ' })
  @Validate(IsUnique, ['player', 'name'])
  name: string;

  @IsNotEmpty({ message: 'Preencha o sexo' })
  @ApiProperty()
  sex: number;

  @IsNotEmpty({ message: 'Preencha o account_id' })
  @ApiProperty()
  account_id: number;
}
