import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tableTypeIds: string[];
}
