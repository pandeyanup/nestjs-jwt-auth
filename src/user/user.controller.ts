import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { UserService } from './user.service';
import { UserPayloadDto } from './dto/user.dto';
import { Role } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  @Roles(Role.ADMIN, Role.SUPERADMIN, Role.MODERATOR)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async findAll() {
    const users = await this.userService.users({
      take: 999999,
    });
    if (users.length === 0) {
      return new HttpException('No users found', HttpStatus.NOT_FOUND);
    }
    // remove password from user object
    users.forEach((user) => {
      delete user.password;
    });
    return users;
  }

  @Post('add')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async addUser(@Request() req, @Body() body: UserPayloadDto) {
    const user = await this.userService.user({
      email: body.email,
    });

    if (user) {
      return new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    if (body.role === Role.SUPERADMIN) {
      return new HttpException(
        'Forbidden role assignment',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!Object.values(Role).includes(body.role)) {
      return new HttpException(
        'Invalid role assignment',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashedPassword = await this.userService.hashPassword(body.password);
    body.password = hashedPassword;

    const newUser = await this.userService.createUser(body);

    if (!newUser) {
      return new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    delete newUser.password;
    return newUser;
  }

  @Get('profile/:id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async profile(@Param('id') id: string) {
    const user = await this.userService.user({ id });
    if (!user) {
      return new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    delete user.password;
    // TODO: return all data associated with the user
    return user;
  }

  @Patch('update/:id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async updateUser(
    @Request() req,
    @Body() body: UserPayloadDto,
    @Param('id') id: string,
  ) {
    const user = await this.userService.user({
      email: body.email,
    });

    if (user.id != id) {
      return new HttpException(
        'Provided email is already used',
        HttpStatus.NOT_FOUND,
      );
    }

    if (body.role === Role.SUPERADMIN) {
      return new HttpException(
        'Forbidden role assignment',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!Object.values(Role).includes(body.role)) {
      return new HttpException(
        'Invalid role assignment',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.role === Role.SUPERADMIN) {
      return new HttpException(
        'Cannot update superadmin user',
        HttpStatus.FORBIDDEN,
      );
    }

    const updatedAt = new Date().toISOString();
    const hashedPassword = await this.userService.hashPassword(body.password);
    body.password = hashedPassword;

    const updatedUser = await this.userService.updateUser({
      where: { email: body.email },
      data: { ...body, updatedAt },
    });

    if (!updatedUser) {
      return new HttpException(
        'Error updating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    delete updatedUser.password;
    return updatedUser;
  }

  @Delete('delete/:id')
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async deleteUser(@Request() req, @Param('id') id: string) {
    const user = await this.userService.user({
      id,
    });

    if (!user) {
      return new HttpException('User does not exist', HttpStatus.NOT_FOUND);
    }

    if (user.role === Role.SUPERADMIN) {
      return new HttpException(
        'Cannot delete superadmin user',
        HttpStatus.FORBIDDEN,
      );
    }

    const deletedUser = await this.userService.deleteUser({
      id,
    });

    if (!deletedUser) {
      return new HttpException(
        'Error deleting user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return deletedUser;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req) {
    const user = await this.userService.user({ id: req.user.id });
    if (!user) {
      return new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  @Patch('update-me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Request() req, @Body() body: UserPayloadDto) {
    return this.updateUser(req, body, req.user.id);
  }
}
