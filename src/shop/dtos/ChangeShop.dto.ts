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

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

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
}

export class ChangeShopPhoneDto {
  @IsString()
  @IsNotEmpty()
  oldPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  newPhoneNumber: string;
}
