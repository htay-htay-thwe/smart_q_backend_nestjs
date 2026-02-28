import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { EmailService } from '../email/email.service';

@Module({
  providers: [OtpService, EmailService],
  exports: [OtpService],
})
export class OtpModule {}