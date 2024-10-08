import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CharacterService } from './character.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Character')
@Controller('api/v1/characters')
@UseGuards(AuthGuard)

export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um Personagem' })
  create(@Body() createCharacterDto: CreateCharacterDto) {
    return this.characterService.createNew(createCharacterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os personagens' })
  findAll() {
    return this.characterService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um Personagem pelo ID' })
  findOne(@Param('id') id: string) {
    return this.characterService.findOneById(+id);
  }

  @Get('user/:id')
  @ApiOperation({ summary: 'Busca personagens pelo ID do usuario' })
  findAllByUser(@Param('id') id: string) {
    return this.characterService.findAllByUser(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza um Personagem' })
  update(
    @Param('id') id: string,
    @Body() updateCharacterDto: UpdateCharacterDto,
  ) {
    return this.characterService.updateById(+id, updateCharacterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deleta um Personagem' })
  remove(@Param('id') id: string) {
    return this.characterService.deleteById(+id);
  }
}
