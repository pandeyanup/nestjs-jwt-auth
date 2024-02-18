import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AccessContorlService } from 'src/auth/shared/access-control.service';

@Module({
  providers: [UserService, PrismaService, JwtService, AccessContorlService],
  controllers: [UserController],
})
export class UserModule {}
