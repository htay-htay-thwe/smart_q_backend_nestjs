import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopTypes, ShopTypesSchema } from '../schemas/ShopTypes.schema';
import { ShopTypesController } from './shop-types.controller';
import { ShopTypesService } from './shop-types.service';
import { CacheInterceptor } from '@nestjs/cache-manager/dist/interceptors/cache.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core/constants';
import { CacheModule } from '@nestjs/cache-manager/dist/cache.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShopTypes.name, schema: ShopTypesSchema },
    ]),
  ],
  controllers: [ShopTypesController],
  providers: [ShopTypesService,{
          provide: APP_INTERCEPTOR,
          useClass: CacheInterceptor,
        }],
})
export class ShopTypesModule {}
