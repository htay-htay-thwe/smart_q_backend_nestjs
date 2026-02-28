import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
  }

  async sendVerificationCode(email: string, otp: string) {
    if (!process.env.SENDGRID_SENDER_EMAIL) {
      throw new Error('SENDGRID_SENDER_EMAIL environment variable is not set');
    }
    const msg = {
      to: email,
      from: process.env.SENDGRID_SENDER_EMAIL, // must be verified in SendGrid
      subject: 'Email Verification Code',
      text: `Your verification code is: ${otp}`,
      html: `<strong>Your verification code is: ${otp}</strong>`,
    };

    try {
      await sgMail.send(msg);
      console.log('Email sent successfully');
      return true;
    } catch (error) {
      console.error('SendGrid Error:', error.response?.body || error);
      return false;
    }
  }
}
