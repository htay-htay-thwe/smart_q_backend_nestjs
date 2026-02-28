import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private sgMail;

  constructor() {
    this.sgMail = require('@sendgrid/mail');
    this.sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendVerificationCode(email: string, otp: string) {
    const msg = {
      to: email,
      from: process.env.SENDGRID_SENDER_EMAIL,
      subject: 'Email Verification Code',
      text: `Your verification code is: ${otp}`,
      html: `<strong>Your verification code is: ${otp}</strong>`,
    };

    try {
      await this.sgMail.send(msg);
      console.log('Email sent successfully');
      return true;
    } catch (error) {
      console.error('SendGrid Error:', error.response?.body || error);
      return false;
    }
  }
}
