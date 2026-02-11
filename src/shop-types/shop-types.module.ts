import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShopTypes, ShopTypesSchema } from '../schemas/ShopTypes.schema';
import { ShopTypesController } from './shop-types.controller';
import { ShopTypesService } from './shop-types.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShopTypes.name, schema: ShopTypesSchema },
    ]),
  ],
  controllers: [ShopTypesController],
  providers: [ShopTypesService],
})
export class ShopTypesModule {}
