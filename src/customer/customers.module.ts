import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { OtpService } from '../otp/otp.service';
import { Customers, CustomersSchema } from '../schemas/Customers.schema';
import { Otp, OtpSchema } from '../schemas/Otp.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customers.name, schema: CustomersSchema },
      { name: Otp.name, schema: OtpSchema },
    ]),
    AuthModule,
    CloudinaryModule,
  ],
  controllers: [CustomersController],
  providers: [CustomersService, OtpService],
})
export class CustomersModule {}
