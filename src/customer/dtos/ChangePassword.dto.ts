import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

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
  @IsString()
  @IsNotEmpty()
  oldPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  newPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  oldOtp: string;

  @IsString()
  @IsNotEmpty()
  newOtp: string;
}

export class ChangeEmailDto {
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
