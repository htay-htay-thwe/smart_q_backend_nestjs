import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Customers {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  email?: string;

  @Prop({ required: false })
  phoneNumber?: string;

  @Prop({ required: false, select: false })
  password?: string;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

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

CustomersSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $type: 'string' } },
    name: 'email_unique',
  },
);
CustomersSchema.index(
  { phoneNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { phoneNumber: { $type: 'string' } },
    name: 'phoneNumber_unique',
  },
);
