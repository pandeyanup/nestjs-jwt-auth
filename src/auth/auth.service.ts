import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { SignupPayloadDto, UserAuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.user({
      email: email,
    });

    if (!user)
      return new HttpException(
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );

    if (
      user &&
      (await this.userService.comparePassword(password, user.password))
    ) {
      const result: UserAuthResponseDto = {
        id: user.id,
        email: user.email,
        name: user.name,
      };

      return {
        data: result,
        token: this.jwtService.sign(result),
      };
    }
    return new HttpException(
      'Invalid email or password',
      HttpStatus.UNAUTHORIZED,
    );
  }

  async signup(payload: SignupPayloadDto) {
    if (payload.password !== payload.confirmPassword)
      return new HttpException(
        'Password confirmation does not match',
        HttpStatus.BAD_REQUEST,
      );

    if (await this.userService.user({ email: payload.email }))
      return new HttpException(
        'User with that email already exists',
        HttpStatus.BAD_REQUEST,
      );

    delete payload.confirmPassword;
    // hash the password
    payload.password = await this.userService.hashPassword(payload.password);
    console.log(payload.password);
    // new user role is always USER
    // Admins can change role of user
    const userPayload = { ...payload, role: Role.USER };
    const user = await this.userService.createUser(userPayload);
    if (!user)
      return new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    const result: UserAuthResponseDto = {
      id: user.id,
      email: user.email,
      name: user.name,
    };
    const token = this.jwtService.sign(result);
    return { data: result, token: token };
  }
}
