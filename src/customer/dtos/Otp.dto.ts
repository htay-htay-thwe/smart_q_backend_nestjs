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

export class SendOtpEmailDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class VerifyOtpEmailDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
