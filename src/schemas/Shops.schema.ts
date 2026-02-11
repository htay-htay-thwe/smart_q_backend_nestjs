import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TableTypes } from './TableTypes.schema';
import mongoose from 'mongoose';
import { ShopTypes } from './ShopTypes.schema';

@Schema()
export class Shops {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, unique: true })
  phoneNumber: number;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  shopImg: string;

  @Prop({ required: true })
  shopTitle: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopTypes',
    required: true,
  })
  shopTypes: ShopTypes;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TableTypes' }],
    required: false,
  })
  tableTypes: TableTypes[];
}
export const ShopsSchema = SchemaFactory.createForClass(Shops);
