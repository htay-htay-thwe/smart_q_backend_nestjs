import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CustomerLoginDto {
  @IsNumber()
  @IsNotEmpty()
  phoneNumber: number;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
