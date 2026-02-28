import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class SendOtpEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyOtpEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
