import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TableTypes } from './TableTypes.schema';
import mongoose from 'mongoose';
import { ShopTypes } from './ShopTypes.schema';

@Schema({ timestamps: true })
export class Shops {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  shopImg: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: {
      fullAddress: String,
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
  })
  address: {
    fullAddress: string;
    location: {
      type: string;
      coordinates: number[];
    };
  };

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShopTypes',
    required: true,
  })
  shopTypes: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TableTypes' }],
    required: false,
  })
  tableTypes: TableTypes[];
}
export const ShopsSchema = SchemaFactory.createForClass(Shops);
ShopsSchema.index({ 'address.location': '2dsphere' });
