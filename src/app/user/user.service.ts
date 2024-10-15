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
import { hash, compare } from 'bcrypt';
import * as dotenv from 'dotenv';
import { IsEmail, IsNotEmpty, IsString, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import * as validator from 'validator';

dotenv.config();

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
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: true, // Enforce strict TLS
      },
    });
  }

  async findAll() {
    return this.prisma.account.findMany();
  }

  async createNew(data: CreateUserDto) {
    try {
      // Validate and sanitize input
      const userDto = plainToClass(CreateUserDto, data);
      const errors = await validate(userDto);
      if (errors.length > 0) {
        throw new BadRequestException('Validation failed');
      }

      const sanitizedUsername = validator.escape(data.name);
      const sanitizedEmail = validator.normalizeEmail(data.email);

      // Check if sanitizedEmail is valid
      if (!sanitizedEmail) {
        throw new BadRequestException('Invalid email format');
      }

      const hashedPassword = await this.hashPassword(data.password);

      if (sanitizedUsername.toLowerCase() === 'nobody') {
        throw new BadRequestException('Cannot create name');
      }

      const user = await this.prisma.account.create({
        data: {
          name: sanitizedUsername,
          email: sanitizedEmail,
          password: hashedPassword,
        },
      });

      // Send verification email here
      return user;
    } catch (error) {
      throw new BadRequestException('User creation failed');
    }
  }

  async hashPassword(password: string) {
    return await hash(password, 10);
  }

  async validatePassword(password: string, hash: string) {
    return await compare(password, hash);
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
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async findOneById(id: number) {
    try {
      console.log('id',id);
      const user = await this.prisma.account.findUnique({
        where: { id },
      });
      const players = await this.charService.findAllByUser(id);
      return { ...user, players };
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  async findByEmail(email: string) {
    const sanitizedEmail = validator.normalizeEmail(email);

    // Check if sanitizedEmail is valid
    if (!sanitizedEmail) {
      throw new BadRequestException('Invalid email format');
    }

    const user = await this.prisma.account.findUnique({
      where: { email: sanitizedEmail },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByUsername(name: string) {
    const sanitizedUsername = validator.escape(name);
    const user = await this.prisma.account.findUnique({
      where: { name: sanitizedUsername },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateById(id: number, data: Partial<UpdateUserDto>) {
    try {
      if (data.password) {
        data.password = await this.hashPassword(data.password);
      }
      await this.prisma.account.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new BadRequestException('Update failed');
    }
  }

  async deleteById(id: number): Promise<void> {
    try {
      const user = await this.prisma.account.findUnique({ where: { id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      await this.prisma.account.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException('Delete failed');
    }
  }

  async requestPasswordReset(payload: ResetPassReqDto) {
    const user = await this.findByEmail(payload.email);
    const token = await this.jwtService.signAsync(
      { id: user.id, email: user.email },
      { expiresIn: '1h' }, // Shorten expiration for security
    );

    const resetLink = `${payload.redirect_link}?token=${token}`;
    await this.sendMail(
      user.email,
      'Password Reset Request',
      `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
        </head>
        <body>
            <p>Hello ${user.name},</p>
            <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
            <p>To reset your password, click the link below:</p>
            <p><a href="${resetLink}">Reset Password</a></p>
            <p>This link is valid for 1 hour.</p>
            <p>Best regards,<br>Your Team</p>
        </body>
      </html>`,
    );
  }

  async sendMail(to: string, subject: string, html: string) {
    return await this.transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (e) {
      throw new BadRequestException('Invalid token');
    }
  }

  async sendVerificationEmail(userId: number, email: string) {
    const token = await this.jwtService.signAsync(
      { id: userId, email },
      { expiresIn: '1h' },
    );

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await this.sendMail(
      email,
      'Email Verification',
      `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
        </head>
        <body>
            <p>Hello,</p>
            <p>Please verify your email by clicking the link below:</p>
            <p><a href="${verificationLink}">Verify Email</a></p>
            <p>This link is valid for 1 hour.</p>
            <p>Best regards,<br>Your Team</p>
        </body>
      </html>`,
    );
  }

  async verifyEmail(token: string) {
    try {
      const payload = await this.verifyToken(token);
      await this.prisma.account.update({
        where: { id: payload.id },
        data: {  },
      });
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }
}
