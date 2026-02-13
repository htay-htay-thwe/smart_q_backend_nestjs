import { Module } from '@nestjs/common';
import { ShopsModule } from './shop/shops.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShopTypesModule } from './shop-types/shop-types.module';
import { TableTypesModule } from './table-types/table-types.module';
import { CustomersModule } from './customer/customers.module';
import { AuthModule } from './auth/auth.module';
import { QueuesModule } from './queue/queues.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ShopsModule,
    ShopTypesModule,
    TableTypesModule,
    CustomersModule,
    AuthModule,
    QueuesModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
