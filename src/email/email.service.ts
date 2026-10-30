import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;
  private readonly sender: string;

  constructor() {
    const user = process.env.GMAIL_USER;
    const appPassword = process.env.GMAIL_APP_PASSWORD;
    if (!user || !appPassword) {
      throw new Error(
        'GMAIL_USER and GMAIL_APP_PASSWORD are not configured',
      );
    }
    const senderName = process.env.GMAIL_FROM_NAME?.trim() || 'SmartQ';
    this.sender = `${senderName} <${user}>`;
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass: appPassword },
    });
  }

  async sendVerificationCode(email: string, otp: string) {
    try {
      const data = await this.transporter.sendMail({
        from: this.sender,
        to: email,
        subject: 'Email Verification Code - SmartQ',
        text: `Your verification code is: ${otp}`,
        html: `<strong>Your verification code is:</strong><h1>${otp}</h1>`,
      });
      if (!data.messageId) {
        console.error('Gmail SMTP Error: No message ID returned');
        return false;
      }
      console.log(`Email sent successfully: ${data.messageId}`);
      return true;
    } catch (error) {
      console.error('Gmail SMTP Error:', error);
      return false;
    }
  }
}
