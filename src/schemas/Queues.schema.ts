import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Queues {
  @Prop({ required: true })
  queue_number: number;

  @Prop({ required: true })
  table_type_id: string;

  @Prop({ required: false, default: null })
  table_no: string;

  @Prop({ required: false, default: null })
  queue_qr: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: false, default: '' })
  userRequirements: string;

  @Prop({ required: false, default: 0 })
  estimated_wait_time: number;

  @Prop({ required: false, default: false })
  notification_sent: boolean;

  @Prop({ required: false, default: false })
  notified_20min: boolean;

  @Prop({ required: false, default: false })
  notified_10min: boolean;

  @Prop({ required: false, default: false })
  notified_5min: boolean;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shops',
    required: true,
  })
  shop_id: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customers',
    required: true,
  })
  customer_id: string;
}

export const QueueSchema = SchemaFactory.createForClass(Queues);
