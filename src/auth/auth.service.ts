import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { SignupPayloadDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.user({
      email: email,
    });
    if (user && user.password === pass) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return {
        data: result,
        token: this.jwtService.sign(result),
      };
    }
    return null;
  }

  async signup(payload: SignupPayloadDto) {
    const user = await this.userService.createUser(payload);
    if (!user) return 'User not created';
    const { password, ...result } = user;
    console.log(password);
    return this.jwtService.sign(result);
  }
}
