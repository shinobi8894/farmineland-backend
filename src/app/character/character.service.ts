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
    // Check if the user is authenticated and authorized
    const user = await this.userService.findOneById(data.account_id);
    if (!user) {
      throw new BadRequestException('User not found or not authenticated');
    }

    if (user.players?.length >= 4) {
      throw new BadRequestException('Cannot create another character');
    }

    const characterName = data.name.toLowerCase();
    if (characterName === 'nobody' || characterName.length < 3 || !/^[a-zA-Z0-9]+$/.test(characterName)) {
      throw new BadRequestException('Invalid character name');
    }

    try {
      return await this.prisma.player.create({
        data: {
          name: data.name,
          sex: data.sex,
          conditions: Buffer.from('undefined', 'utf-8'), // Consider re-evaluating this
          skill_axe: 10,
          skill_sword: 10,
          skill_shielding: 10,
          mana: 50,
          manamax: 50,
          skill_fist_tries: 10,
          skill_club: 10,
          skill_dist: 10,
          skill_fishing: 10,
          account_id : data.account_id
        },
      });
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to create character');
    }
  }

  async findOneById(id: number) {
    const player = await this.prisma.player.findUnique({ where: { id } });
    if (!player) {
      throw new NotFoundException('Player not found');
    }
    return player;
  }

  async updateById(id: number, data: Partial<UpdateCharacterDto>) {
    try {

      console.log('update', id);
      console.log('update_data', data);
      const updatedPlayer = await this.prisma.player.update({
        where: { id },
        data,
      });

      console.log('updated', updatedPlayer);
      return updatedPlayer; // Return updated player for confirmation
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Player not found');
    }
  }

  async deleteById(id: number): Promise<void> {
    const player = await this.prisma.player.findUnique({ where: { id } });
    if (!player) {
      throw new NotFoundException('Player not found');
    }
    await this.prisma.player.delete({ where: { id } });
  }
}
