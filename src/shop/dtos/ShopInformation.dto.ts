import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
  IsArray,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsNumber()
  @IsNotEmpty()
  phoneNumber: number;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  shop_img: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  shopTypeId: string;

  @IsArray()
  @ValidateNested({ each: true })
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
