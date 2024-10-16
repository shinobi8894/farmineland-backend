import {
    Controller,
    Post,
    Body,
    UseGuards,
  } from '@nestjs/common';
  import { ApiOperation, ApiTags } from '@nestjs/swagger';
  import { AuthGuard } from '../auth/auth.guard';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { WithdrawService } from './withdraw.service';
  
  @ApiTags('Withdraw')
  @Controller('api/v1/withdraw')
  @UseGuards(AuthGuard)
  
  export class WithdrawController {
    constructor(private readonly withdrawService: WithdrawService) {}
  
    @Post()
    @ApiOperation({ summary: 'Cria um Personagem' })
    create(@Body() createWithdrawDto: CreateWithdrawDto) {
      return this.withdrawService.createNew(createWithdrawDto);
    }
  }
  