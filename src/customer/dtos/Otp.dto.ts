import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendOtpDto {
  @IsNumber()
  @IsNotEmpty()
  phoneNumber: number;
}

export class VerifyOtpDto {
  @IsNumber()
  @IsNotEmpty()
  phoneNumber: number;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
