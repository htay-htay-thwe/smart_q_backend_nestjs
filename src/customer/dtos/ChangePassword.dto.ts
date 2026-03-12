import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class ChangePasswordDto {

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;

}

export class ChangePhoneNumberDto {
  @IsString()
  @IsNotEmpty()
  oldPhoneNumber: string;

  @IsString()
  @IsNotEmpty()
  newPhoneNumber: string;
}

export class ChangeEmailDto {
  @IsEmail()
  @IsNotEmpty()
  oldEmail: string;

  @IsEmail()
  @IsNotEmpty()
  newEmail: string;
}
