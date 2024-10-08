import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './app/auth/auth.module';
import { UserModule } from './app/user/user.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { UploadModule } from './app/upload/upload.module';
import { IsUnique } from './validators/IsUnique.validator';
import { CharacterModule } from './app/character/character.module';
import { PrismaService } from './database/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { LandsModule } from './app/lands/lands.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      privateKey: process.env.JWT_PRIVATE_KEY || 'defaultPrivateKey', // Fallback for development
      secret: process.env.JWT_SECRET || 'defaultSecret', // Use different secret for verification
      signOptions: { expiresIn: '24h' },
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        // Validate required environment variables here
        if (!config.JWT_PRIVATE_KEY) {
          throw new Error('Missing JWT_PRIVATE_KEY');
        }
        return config;
      },
    }),
    AuthModule,
    UserModule,
    UploadModule,
    CharacterModule,
    LandsModule,
  ],
  controllers: [],
  providers: [IsUnique, PrismaService],
  exports: [IsUnique],
})
export class AppModule {}
