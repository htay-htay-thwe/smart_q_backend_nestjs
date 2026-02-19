import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: false })
  phoneNumber: string;

  @Prop({ required: false })
  email: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ required: true, enum: ['phone', 'email'] })
  type: string;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
