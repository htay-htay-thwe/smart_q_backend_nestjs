import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TableTypes, TableTypesSchema } from '../schemas/TableTypes.schema';
import { TableTypesController } from './table-types.controller';
import { TableTypesService } from './table-types.service';
import { CacheModule } from '@nestjs/cache-manager/dist/cache.module';
import { CacheInterceptor } from '@nestjs/cache-manager/dist/interceptors/cache.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core/constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TableTypes.name, schema: TableTypesSchema },
    ]),
  ],
  controllers: [TableTypesController],
  providers: [TableTypesService,{
          provide: APP_INTERCEPTOR,
          useClass: CacheInterceptor,
        }],
})
export class TableTypesModule {}
