import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from '../user/user.service';

@Injectable()
export class CharacterService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async findAll() {
    return this.prisma.player.findMany();
  }

  async findAllByUser(id: number) {
    return this.prisma.player.findMany({ where: { account_id: id } });
  }

  async createNew(data: CreateCharacterDto) {
    try {
      const nobody = data.name.toLowerCase();
      if (nobody === 'nobody') {
        throw new BadRequestException('Cannot create name');
      }

      const user = await this.userService.findOneById(data.account_id);
      if (user.players?.length === 4) {
        throw new BadRequestException('Cannot create another character');
      }

      return await this.prisma.player.create({
        data: {
          name: data.name,
          sex: data.sex,
          account_id: data.account_id,
          conditions: Buffer.from('undefined', 'utf-8'),
          skill_axe: 10,
          skill_sword: 10,
          skill_shielding: 10,
          mana: 50,
          manamax: 50,
          skill_fist_tries: 10,
          skill_club: 10,
          skill_dist: 10,
          skill_fishing: 10,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneById(id: number) {
    try {
      const player = await this.prisma.player.findUnique({
        where: { id },
      });
      if (!player) {
        throw new NotFoundException(`Player with id ${id} not found`);
      }
      return player;
    } catch (error) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }
  }

  async updateById(id: number, data: Partial<UpdateCharacterDto>) {
    try {
      const updatedPlayer = await this.prisma.player.update({
        where: { id },
        data,
      });
      if (!updatedPlayer) {
        throw new NotFoundException(`Player with id ${id} not found`);
      }
    } catch (error) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }
  }

  async deleteById(id: number): Promise<void> {
    try {
      const player = await this.prisma.player.findUnique({ where: { id } });
      if (!player) {
        throw new NotFoundException(`Player with id ${id} not found`);
      }
      await this.prisma.player.delete({ where: { id } });
    } catch (error) {
      throw new NotFoundException(`Player with id ${id} not found`);
    }
  }
}
