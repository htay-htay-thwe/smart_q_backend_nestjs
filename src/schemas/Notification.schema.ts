import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Customers', required: true, index: true })
  customer_id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Queues', required: false, index: true })
  queue_id?: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false, index: true })
  isRead: boolean;

  @Prop({ type: Object, default: {} })
  data: Record<string, string>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ customer_id: 1, createdAt: -1 });
