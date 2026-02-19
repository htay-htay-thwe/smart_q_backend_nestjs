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
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}

export class VerifyPhoneOtpDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
