import { IsNumber, IsString } from 'class-validator';

export class ProductPayloadDto {
  @IsString({ message: 'Name must be a string' })
  name: string;

  @IsString({ message: 'Description must be a string' })
  description: string;

  @IsNumber()
  price: number;
}
