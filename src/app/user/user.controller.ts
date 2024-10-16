import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthGuard } from '../auth/auth.guard';
import { ResetPassDto, ResetPassReqDto } from './dto/resetPassReqDto.dto copy';

@SkipThrottle()
@ApiTags('User')
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um usuario' })
  @ApiResponse({
    status: 201,
    description: 'Cria um usuario',
  })
  async createNew(@Body() body: CreateUserDto) {
    return this.userService.createNew(body);
  }

  @Get()
  @UseGuards(AuthGuard) // Guard applied here
  @ApiOperation({ summary: 'Lista todos os usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista todos os usuarios',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard) // Guard applied here
  @ApiOperation({ summary: 'Puxa informacoes de um unico usuario' })
  @ApiResponse({
    status: 200,
    description: 'Puxa informacoes de um unico usuario',
  })
  async findOneById(@Param('id') id: number) {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard) // Guard applied here
  @ApiOperation({ summary: 'Atualiza informacoes de um unico usuario' })
  @ApiResponse({
    status: 200,
    description: 'Atualiza informacoes de um unico usuario',
  })
  async updateById(@Param('id') id: number, @Body() body: UpdateUserDto) {
    return this.userService.updateById(id, body);
  }

  @Post('request-password-reset')
  @UseGuards(AuthGuard) // Guard applied here
  @ApiBody({
    description: 'Valores que vao no body',
    type: ResetPassReqDto,
  })
  @ApiOperation({
    summary: 'Faz requisicao para pegar o token pra atualizar senha',
  })
  async requestPasswordReset(@Body() payload: ResetPassReqDto) {
    return await this.userService.requestPasswordReset(payload);
  }

  @Post('reset-password')
  @UseGuards(AuthGuard) // Guard applied here
  @ApiBody({
    description: 'Valores que vao no body',
    type: ResetPassDto,
  })
  @ApiOperation({ summary: 'Atualizar a senha de um usuario' })
  async resetPassword(@Body() body: ResetPassDto) {
    return await this.userService.resetPassword(body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard) // Guard applied here
  @ApiOperation({ summary: 'Deleta um unico usuario' })
  async deleteById(@Param('id') id: number) {
    await this.userService.deleteById(id);
  }
}
