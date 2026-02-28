import { Module } from '@nestjs/common';
import { SmsService } from './phone.service';

@Module({
  providers: [SmsService],
  exports: [SmsService],
})
export class PhoneModule {}
