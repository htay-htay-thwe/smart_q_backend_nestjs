import { IsEmail, IsNotEmpty, IsString, ValidateIf } from 'class-validator';

export class CustomerLoginDto {
  @ValidateIf((o) => !o.phoneNumber)
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required if phone number is not provided' })
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required if email is not provided' })
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
