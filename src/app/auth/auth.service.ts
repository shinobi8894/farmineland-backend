import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DateTime } from 'luxon';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { OAuth2Client } from 'google-auth-library'; // Example for Google OAuth

@Injectable()
export class AuthService {
  private oauthClient: OAuth2Client;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async login(user: LoginDto) {
    const userJson = { name: user.name, password: user.password };
    const token = await this.jwtService.signAsync(userJson);
    const buffered = Buffer.from(token.split('.')[1], 'base64').toString();
    const payload = JSON.parse(buffered);
    const expiresIn = DateTime.fromMillis(payload.exp * 1000)
      .toUTC()
      .toISO();
    const userLogged = await this.userService.findByUsername(user.name);
    const { id, email, name, wallet } = userLogged;
    const userResponse = { id, email, name, wallet };
    return { token, expiresIn, user: userResponse };
  }

  async validate(name: string, password: string) {
    try {
      const user = await this.userService.findByUsername(name);
      const isValid = await this.userService.validatePassword(
        password,
        user.password,
      );
      if (!isValid) throw new Error();
      delete user.password;
      return user;
    } catch (error) {
      throw new ForbiddenException('E-mail e/ou senha estão inválidos');
    }
  }
  
}
