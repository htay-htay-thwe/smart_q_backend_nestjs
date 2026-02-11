import { Module } from '@nestjs/common';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Shops, ShopsSchema } from '../schemas/Shops.schema';
import { ShopTypes, ShopTypesSchema } from '../schemas/ShopTypes.schema';
import { TableTypes, TableTypesSchema } from '../schemas/TableTypes.schema';
import { Otp, OtpSchema } from '../schemas/Otp.schema';
import { AuthModule } from '../auth/auth.module';
import { OtpService } from '../customer/otp.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Shops.name,
        schema: ShopsSchema,
      },
      {
        name: ShopTypes.name,
        schema: ShopTypesSchema,
      },
      {
        name: TableTypes.name,
        schema: TableTypesSchema,
      },
      {
        name: Otp.name,
        schema: OtpSchema,
      },
    ]),
    AuthModule,
  ],
  controllers: [ShopsController],
  providers: [ShopsService, OtpService],
})
export class ShopsModule {}
