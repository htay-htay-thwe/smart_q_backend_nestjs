import { Module } from '@nestjs/common';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Shops, ShopsSchema } from '../schemas/Shops.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Shops.name, schema: ShopsSchema }]),
  ],
  controllers: [ShopsController],
  providers: [ShopsService],
})
export class ShopsModule {}
