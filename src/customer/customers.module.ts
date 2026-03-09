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
import { PhoneModule } from '../phone/phone.module';
import { CacheInterceptor } from '@nestjs/cache-manager/dist/interceptors/cache.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core/constants';
import { CacheModule } from '@nestjs/cache-manager/dist/cache.module';

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
  providers: [CustomersService, OtpService, EmailService, SmsService,{
          provide: APP_INTERCEPTOR,
          useClass: CacheInterceptor,
        }],
})
export class CustomersModule {}
