import { IsNotEmpty, IsString } from 'class-validator';

export class GenerateQrDto {
  @IsString()
  @IsNotEmpty()
  queue_id: string;

  @IsString()
  @IsNotEmpty()
  queue_qr: string;
}
