import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AccessContorlService } from 'src/auth/shared/access-control.service';

@Module({
  controllers: [ProductsController],
  imports: [AuthModule],
  providers: [
    ProductsService,
    JwtService,
    UserService,
    PrismaService,
    AccessContorlService,
  ],
})
export class ProductsModule {}
