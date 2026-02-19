import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CustomerInformationDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  @IsString() 
  email?: string; 

  @IsOptional()
  @IsNumber({}, { message: 'Phone number must be a number' }) 
  phoneNumber?: number; 

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  profileImg: string;
}

export class ChangeUsernameDto {
  @IsString()
  @IsNotEmpty()
  customer_id: string;

  @IsString()
  @IsNotEmpty()
  newUsername: string;
}
