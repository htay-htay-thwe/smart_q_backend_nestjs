import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class ShopQrToken {
  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Shops', required: true, index: true })
  shop_id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Queues', default: null })
  used_by_queue_id: string | null;

  @Prop({ type: Date, default: null })
  used_at: Date | null;

  @Prop({ type: Date, required: true, expires: 0 })
  expires_at: Date;
}

export const ShopQrTokenSchema = SchemaFactory.createForClass(ShopQrToken);
