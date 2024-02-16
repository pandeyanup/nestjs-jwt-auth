import { IsEmail, IsString } from 'class-validator';

export class SignupPayloadDto {
  @IsString({ message: 'Username must be a string' })
  name: string;

  @IsEmail()
  email: string;

  @IsString({ message: 'Password must be a string' })
  password: string;
}

export class AuthPayloadDto {
  @IsEmail()
  email: string;

  @IsString({ message: 'Password must be a string' })
  password: string;
}
