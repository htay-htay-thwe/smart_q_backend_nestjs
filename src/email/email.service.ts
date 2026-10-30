import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    this.resend = new Resend(apiKey);
  }

  async sendVerificationCode(email: string, otp: string) {
    const from = process.env.RESEND_FROM_EMAIL;
    if (!from) {
      throw new Error('RESEND_FROM_EMAIL is not configured');
    }

    try {
      const { data, error } = await this.resend.emails.send({
        to: [email],
        from,
        subject: 'Email Verification Code - SmartQ',
        text: `Your verification code is: ${otp}`,
        html: `<strong>Your verification code is:</strong><h1>${otp}</h1>`,
      });
      if (error || !data?.id) {
        console.error('Resend Error:', error ?? 'No message ID returned');
        return false;
      }
      console.log(`Email sent successfully: ${data.id}`);
      return true;
    } catch (error) {
      console.error('Resend Error:', error);
      return false;
    }
  }
}
