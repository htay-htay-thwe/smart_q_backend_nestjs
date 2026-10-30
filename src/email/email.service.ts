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

    this.sender = user;
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user,
        pass: appPassword,
      },
      requireTLS: true,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  async sendVerificationCode(email: string, otp: string) {
    try {
      await this.transporter.sendMail({
        from: this.sender,
        to: email,
        subject: 'Email Verification Code - SmartQ',
        text: `Your verification code is: ${otp}`,
        html: `<strong>Your verification code is:</strong><h1>${otp}</h1>`,
      });
      console.log('Email sent successfully through Gmail SMTP');
      return true;
    } catch (error) {
      const smtpError = error as {
        code?: string;
        command?: string;
        responseCode?: number;
        message?: string;
      };
      console.error('Gmail SMTP Error:', {
        code: smtpError?.code,
        command: smtpError?.command,
        responseCode: smtpError?.responseCode,
        message: smtpError?.message,
      });
      return false;
    }
  }
}
