import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CustomerLoginDto {
  @ValidateIf((o) => !o.email)
  @IsNotEmpty({ message: 'Phone number is required if email is not provided' })
  @IsString()
  phoneNumber?: string;

  @ValidateIf((o) => !o.phoneNumber)
  @IsNotEmpty({ message: 'Email is required if phone number is not provided' })
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
