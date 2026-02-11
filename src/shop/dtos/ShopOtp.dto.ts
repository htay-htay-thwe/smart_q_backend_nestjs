import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendEmailOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyEmailOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class SendPhoneOtpDto {
  @IsNumber()
  @IsNotEmpty()
  phoneNumber: number;
}

export class VerifyPhoneOtpDto {
  @IsNumber()
  @IsNotEmpty()
  phoneNumber: number;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
