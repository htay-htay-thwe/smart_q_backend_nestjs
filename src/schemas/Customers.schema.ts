import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Customers {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, unique: true })
  email: string;

  @Prop({ required: false, unique: true })
  phoneNumber: number;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: false })
  profileImg: string;

  @Prop({ default: false })
  isVerified: boolean;
  _id: any;
}

export const CustomersSchema = SchemaFactory.createForClass(Customers);
