import { Module } from '@nestjs/common';
import { ShopsModule } from './shop/shops.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShopTypesModule } from './shop-types/shop-types.module';
import { TableTypesModule } from './table-types/table-types.module';
import { CustomersModule } from './customer/customers.module';
import { AuthModule } from './auth/auth.module';
import { QueuesModule } from './queue/queues.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FirebaseModule } from './firebase/firebase.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    FirebaseModule,
    ShopsModule,
    ShopTypesModule,
    TableTypesModule,
    CustomersModule,
    AuthModule,
    QueuesModule,
      CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        store: redisStore.default,
        host: config.get<string>('REDIS_HOST'),
        port: config.get<number>('REDIS_PORT'),
        password: config.get<string>('REDIS_PASSWORD'),
        ttl: config.get<number>('REDIS_TTL'),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
})
export class AppModule {}
