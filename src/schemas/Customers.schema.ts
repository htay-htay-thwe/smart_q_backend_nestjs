import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Customers {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, sparse: true })
  email?: string;

  @Prop({ unique: true, sparse: true })
  phoneNumber?: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: false })
  profileImg: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ required: false })
  fcmToken?: string;

  @Prop({ type: [String], default: [] })
  pushTokens?: string[];

  _id: any;
}

export const CustomersSchema = SchemaFactory.createForClass(Customers);
