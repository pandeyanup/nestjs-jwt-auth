import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { SignupPayloadDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalGuard)
  login(@Request() req) {
    return req.user;
  }

  @Post('signup')
  signup(@Body() body: SignupPayloadDto) {
    return this.authService.signup(body);
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  status(@Request() req) {
    return req.user;
  }
}
