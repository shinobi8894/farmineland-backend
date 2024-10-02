import { Body, Controller, Get, Post } from '@nestjs/common';
import { LandsService } from './lands.service';
import { ApiTags } from '@nestjs/swagger';
import { RaffleDto } from './dto/raffle.dto';

@ApiTags('Lands')
@Controller('/api/v1/lands')
export class LandsController {
  constructor(private readonly landsService: LandsService) {}

  @Get()
  async findAll() {
    return await this.landsService.findAll();
  }

  @Get('lands-saved')
  async findAllSavedLand() {
    return await this.landsService.findAllSavedLand();
  }

  @Post('open-chest')
  async findSorted(@Body() RaffleDto: RaffleDto) {
    return await this.landsService.raffleLand(RaffleDto);
  }
}
