import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { EmailService } from '../email/email.service';
import { SmsService } from '../phone/phone.service';

@Module({
  providers: [OtpService, EmailService, SmsService],
  exports: [OtpService],
})
export class OtpModule {}
