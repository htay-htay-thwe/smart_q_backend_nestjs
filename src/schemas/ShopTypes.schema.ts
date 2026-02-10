import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class ShopTypes {
  @Prop({ required: true })
  name: string;
}

export const ShopTypesSchema = SchemaFactory.createForClass(ShopTypes);
