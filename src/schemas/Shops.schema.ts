import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Shops {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  shop_img: string;

  @Prop({ required: true })
  shopTitle: string;

  @Prop({ required: true })
  descirption: string;
}
export const ShopsSchema = SchemaFactory.createForClass(Shops);
