import { IsNotEmpty, IsString } from 'class-validator';

export class AssignTableDto {
  @IsString()
  @IsNotEmpty()
  queue_id: string;

  @IsString()
  @IsNotEmpty()
  table_no: string;

  @IsString()
  @IsNotEmpty()
  table_type_id: string;

  @IsString()
  @IsNotEmpty()
  shop_id: string;
}

export class TableStatusDto {
  @IsString()
  @IsNotEmpty()
  queue_id: string;

  @IsString()
  @IsNotEmpty()
  table_no: string;

  @IsString()
  @IsNotEmpty()
  table_type_id: string;

  @IsString()
  @IsNotEmpty()
  shop_id: string;
}
