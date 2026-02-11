import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ChangeShopPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsNumber()
  @IsNotEmpty()
  phoneNumber: number;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ChangeShopEmailDto {
  @IsEmail()
  @IsNotEmpty()
  oldEmail: string;

  @IsEmail()
  @IsNotEmpty()
  newEmail: string;

  @IsString()
  @IsNotEmpty()
  oldOtp: string;

  @IsString()
  @IsNotEmpty()
  newOtp: string;
}

export class ChangeShopPhoneDto {
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
