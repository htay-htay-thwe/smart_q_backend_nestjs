import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
  IsArray,
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
  address: string;

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
  shopTitle: string;

  @IsString()
  @IsNotEmpty()
  descirption: string;

  @IsString()
  @IsNotEmpty()
  shopTypeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TableTypeDto)
  tableTypes: TableTypeDto[];
}
