import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class TableTypes {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ required: true })
  shopId: string;
  _id: any;
}
export const TableTypesSchema = SchemaFactory.createForClass(TableTypes);
