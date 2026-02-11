import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class ChangePasswordDto {
  @IsNumber()
  @IsNotEmpty()
  phoneNumber: number;

  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ChangePhoneNumberDto {
  @IsNumber()
  @IsNotEmpty()
  oldPhoneNumber: number;

  @IsNumber()
  @IsNotEmpty()
  newPhoneNumber: number;

  @IsString()
  @IsNotEmpty()
  oldOtp: string;

  @IsString()
  @IsNotEmpty()
  newOtp: string;
}
