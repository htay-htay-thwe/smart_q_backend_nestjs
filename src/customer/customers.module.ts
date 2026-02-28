import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { OtpService } from '../otp/otp.service';
import { Customers, CustomersSchema } from '../schemas/Customers.schema';
import { Otp, OtpSchema } from '../schemas/Otp.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { EmailService } from '../email/email.service';
import { EmailModule } from '../email/email.module';
import { SmsService } from '../phone/phone.service';
import { Sms } from 'twilio/lib/twiml/VoiceResponse';
import { PhoneModule } from '../phone/phone.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customers.name, schema: CustomersSchema },
      { name: Otp.name, schema: OtpSchema },
    ]),
    AuthModule,
    CloudinaryModule,
    EmailModule,
    PhoneModule,
  ],
  controllers: [CustomersController],
  providers: [CustomersService, OtpService, EmailService, SmsService],
})
export class CustomersModule {}
