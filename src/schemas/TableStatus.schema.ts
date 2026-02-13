import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class TableStatus {
  @Prop({ required: true })
  table_no: string;

  @Prop({ required: true })
  table_type_id: string;

  @Prop({ required: true })
  shop_id: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Queues', default: null })
  queue_id: string;
}
export const TableStatusSchema = SchemaFactory.createForClass(TableStatus);
