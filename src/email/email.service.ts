import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendVerificationCode(email: string, code: string) {
    await this.transporter.sendMail({
      from: `"Smart Queue" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Email Verification Code',
      text: `Your verification code is: ${code}`,
    });
  }
}