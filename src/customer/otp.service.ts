import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from '../schemas/Otp.schema';

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private otpModel: Model<Otp>) {}

  generateOtp(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtpToPhone(
    phoneNumber: number,
  ): Promise<{ success: boolean; message: string }> {
    // Generate OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete any existing OTPs for this phone number
    await this.otpModel.deleteMany({
      phoneNumber,
      type: 'phone',
      isVerified: false,
    });

    // Save new OTP
    await this.otpModel.create({
      phoneNumber,
      otp,
      expiresAt,
      isVerified: false,
      type: 'phone',
    });

    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    // For now, we'll just log it (remove this in production)
    console.log(`OTP for phone ${phoneNumber}: ${otp}`);

    return {
      success: true,
      message: `OTP sent to ${phoneNumber} : ${otp}`,
    };
  }

  async sendOtpToEmail(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    // Generate OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete any existing OTPs for this email
    await this.otpModel.deleteMany({
      email,
      type: 'email',
      isVerified: false,
    });

    // Save new OTP
    await this.otpModel.create({
      email,
      otp,
      expiresAt,
      isVerified: false,
      type: 'email',
    });

    // TODO: Integrate with Email service (SendGrid, AWS SES, etc.)
    // For now, we'll just log it (remove this in production)
    console.log(`OTP for email ${email}: ${otp}`);

    return {
      success: true,
      message: `OTP sent to ${email} : ${otp}`,
    };
  }

  async verifyPhoneOtp(phoneNumber: number, otp: string): Promise<boolean> {
    const otpRecord = await this.otpModel.findOne({
      phoneNumber,
      otp,
      type: 'phone',
      isVerified: false,
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException(
        'OTP has expired. Please request a new one.',
      );
    }

    // Mark OTP as verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    return true;
  }

  async verifyEmailOtp(email: string, otp: string): Promise<boolean> {
    const otpRecord = await this.otpModel.findOne({
      email,
      otp,
      type: 'email',
      isVerified: false,
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Check if OTP is expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException(
        'OTP has expired. Please request a new one.',
      );
    }

    // Mark OTP as verified
    otpRecord.isVerified = true;
    await otpRecord.save();

    return true;
  }

  async isPhoneVerified(phoneNumber: number): Promise<boolean> {
    const verified = await this.otpModel.findOne({
      phoneNumber,
      type: 'phone',
      isVerified: true,
    });
    return !!verified;
  }

  async isEmailVerified(email: string): Promise<boolean> {
    const verified = await this.otpModel.findOne({
      email,
      type: 'email',
      isVerified: true,
    });
    return !!verified;
  }
}
