import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class queueData {
  @IsString()
  @IsOptional()
  userRequirements?: string;

  @IsString()
  @IsNotEmpty()
  shop_id: string;

  @IsString()
  @IsNotEmpty()
  table_type_id: string;

  @IsString()
  @IsNotEmpty()
  customer_id: string;
}
