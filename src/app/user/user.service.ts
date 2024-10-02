import { createHash } from 'crypto';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/database/prisma.service';
import { CharacterService } from '../character/character.service';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { ResetPassReqDto, ResetPassDto } from './dto/resetPassReqDto.dto copy';

@Injectable()
export class UserService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => CharacterService))
    private readonly charService: CharacterService,
    private readonly jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'farminelandrecovery@gmail.com',
        pass: 'vrrj ctam jbxk yjda',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async findAll() {
    return this.prisma.account.findMany();
  }

  async createNew(data: CreateUserDto) {
    try {
      const hashedPassword = await this.hashPassword(data.password);
      const nobody = data.name.toLowerCase();
      if (nobody === 'nobody') {
        throw new BadRequestException('Cannot create name');
      }
      const user = await this.prisma.account.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
        },
      });
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOneById(id: number) {
    try {
      const user = await this.prisma.account.findUnique({
        where: { id },
      });
      const players = await this.charService.findAllByUser(id);
      return { ...user, players };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.account.findUnique({
        where: { email },
      });
      if (!user) {
        throw new NotFoundException(`User with email ${email} not found`);
      }
      return user;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findByUsername(name: string) {
    try {
      const user = await this.prisma.account.findUnique({
        where: { name },
      });
      if (!user) {
        throw new NotFoundException(`User with username ${name} not found`);
      }
      return user;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateById(id: number, data: Partial<UpdateUserDto>) {
    try {
      if (data.password) data.password = await this.hashPassword(data.password);
      await this.prisma.account.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async deleteById(id: number): Promise<void> {
    try {
      const user = await this.prisma.account.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      await this.prisma.account.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async requestPasswordReset(payload: ResetPassReqDto) {
    const user = await this.findByEmail(payload.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const token = await this.jwtService.signAsync(
      { id: user.id, email: user.email },
      { expiresIn: '24h' },
    );

    const resetLink = `${payload.redirect_link}?token=${token}`;
    const email = await this.sendMail(
      user.email,
      'Recuperação de Senha - Farmine Land',
      `<!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recuperação de Senha - Farmine Land</title>
        </head>
        <body>
            <p>Olá ${user.name},</p>
            <p>Recebemos uma solicitação para redefinir a sua senha. Se você não fez essa solicitação, por favor, ignore este e-mail. Caso contrário, siga as instruções abaixo para redefinir sua senha.</p>
            <p>Para redefinir sua senha, clique no botão abaixo:</p>
            <p><a href="${resetLink}" style="background-color: rgb(249 115 22); color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px;">Redefinir Senha</a></p>
            <p>Este link é válido por 24 horas. Se o link expirar, você precisará solicitar uma nova recuperação de senha.</p>
            <p>Atenciosamente,<br>Equipe Farmine Land</p>
        </body>
      </html>`,
    );

    return token;
  }

  async sendMail(to: string, subject: string, html: string) {
    return await this.transporter.sendMail({
      from: '"Farmine Land" <farminelandrecovery@gmail.com>',
      to,
      subject,
      html,
    });
  }

  async resetPassword(body: ResetPassDto) {
    const { token, newPassword } = body;
    try {
      const payload = await this.verifyToken(token);
      const hashedPassword = await this.hashPassword(newPassword);
      await this.prisma.account.update({
        where: { id: payload.id },
        data: { password: hashedPassword },
      });
    } catch (error) {
      throw new BadRequestException('Invalid token or expired token');
    }
  }

  async hashPassword(password: string) {
    return createHash('sha1').update(password).digest('hex');
  }

  async validatePassword(password: string, hash: string) {
    const hashedPassword = createHash('sha1').update(password).digest('hex');
    return hashedPassword === hash;
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (e) {
      console.log(e);
      throw new Error('Token inválido');
    }
  }
}
