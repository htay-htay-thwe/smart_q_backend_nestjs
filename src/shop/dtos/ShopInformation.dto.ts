import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
  IsArray,
  IsOptional,
  IsEmail,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class TableTypeDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @IsNotEmpty()
  capacity: number;
}

export class ShopInformationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  fullAddress: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  lng: number;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  shop_img?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  shopTypeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @Type(() => TableTypeDto)
  tableTypes: TableTypeDto[];
}

export class addressDto {
  @IsString()
  @IsNotEmpty()
  shop_id: string;

  @IsString()
  @IsNotEmpty()
  fullAddress: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  lat: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  lng: number;
}

export class shopNameDto {
  @IsString()
  @IsNotEmpty()
  shop_id: string;

  @IsString()
  @IsNotEmpty()
  shopTitle: string;
}
