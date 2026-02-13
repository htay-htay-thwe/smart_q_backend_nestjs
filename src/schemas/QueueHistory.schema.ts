import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class QueueHistory {
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

  @Prop({ required: true })
  completedAt: Date;
}

export const QueueHistorySchema = SchemaFactory.createForClass(QueueHistory);
