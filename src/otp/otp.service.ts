import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from '../schemas/Otp.schema';
import { EmailService } from '../email/email.service';
import { SmsService } from '../phone/phone.service';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private otpModel: Model<Otp>,
    private emailService: EmailService,
    private smsService: SmsService,
  ) {}

  generateOtp(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtpToPhone(
    phoneNumber: string,
  ): Promise<{ success: boolean; message: string }> {
    // Generate OTP
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

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
    // const res = await this.smsService.sendSms(
    //   phoneNumber,
    //   `Your verification code is: ${otp}`,
    // );
    // if (!res) {
    //   return {
    //     success: false,
    //     message: 'Failed to send OTP SMS',
    //   };
    // } else {
    //   return {
    //     success: true,
    //     message: `OTP sent to ${phoneNumber}`,
    //   };
    return {
      success: true,
      message: `OTP sent to ${phoneNumber} - ${otp}`,
    };
  }

  async sendOtpToEmail(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
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

      const res = await this.emailService.sendVerificationCode(email, otp);
      if (!res) {
        return {
          success: false,
          message: 'Failed to send OTP email',
        };
      } else {
        return {
          success: true,
          message: `OTP sent to ${email}`,
        };
      }
    } catch (error) {
      console.error('SEND OTP ERROR:', error);
      return {
        success: false,
        message: 'Internal server error while sending OTP',
      };
    }
  }

  async verifyPhoneOtp(phoneNumber: string, otp: string): Promise<boolean> {
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

  async isPhoneVerified(phoneNumber: string): Promise<boolean> {
    const now = new Date();
    const verified = await this.otpModel.findOne({
      phoneNumber,
      type: 'phone',
      isVerified: true,
      expiresAt: { $gt: now },
    });
    return !!verified;
  }

  async isEmailVerified(email: string): Promise<boolean> {
    const now = new Date();
    const verified = await this.otpModel.findOne({
      email,
      type: 'email',
      isVerified: true,
      expiresAt: { $gt: now },
    });
    return !!verified;
  }
}
