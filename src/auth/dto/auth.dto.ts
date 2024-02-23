import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupPayloadDto {
  @IsString({ message: 'Name must be a string' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name: string;

  @IsEmail()
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(18, { message: 'Password must be at most 18 characters long' })
  password: string;

  @IsString({ message: 'Confirm Password must be a string' })
  @MinLength(8, {
    message: 'Confirm Password must be at least 8 characters long',
  })
  @MaxLength(18, {
    message: 'Confirm Password must be at most 18 characters long',
  })
  confirmPassword: string;
}

export class AuthPayloadDto {
  @IsEmail()
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(18, { message: 'Password must be at most 18 characters long' })
  password: string;
}

export class UserAuthResponseDto {
  id: string;
  email: string;
  name: string;
}
