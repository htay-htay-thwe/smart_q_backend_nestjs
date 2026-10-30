import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly sender: string;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    const senderEmail = process.env.SENDGRID_SENDER_EMAIL;
    if (!apiKey || !senderEmail) {
      throw new Error(
        'SENDGRID_API_KEY and SENDGRID_SENDER_EMAIL are not configured',
      );
    }
    sgMail.setApiKey(apiKey);
    this.sender = senderEmail;
  }

  async sendVerificationCode(email: string, otp: string) {
    try {
      const [response] = await sgMail.send({
        to: email,
        from: this.sender,
        subject: 'Email Verification Code - SmartQ',
        text: `Your verification code is: ${otp}`,
        html: `<strong>Your verification code is:</strong><h1>${otp}</h1>`,
      });
      if (response.statusCode < 200 || response.statusCode >= 300) {
        console.error('SendGrid Error: unexpected response status', {
          statusCode: response.statusCode,
        });
        return false;
      }
      console.log('Email sent successfully through SendGrid');
      return true;
    } catch (error) {
      const sendGridError = error as {
        code?: number | string;
        message?: string;
        response?: { statusCode?: number; body?: unknown };
      };
      console.error('SendGrid Error:', {
        code: sendGridError?.code,
        message: sendGridError?.message,
        statusCode: sendGridError?.response?.statusCode,
        body: sendGridError?.response?.body,
      });
      return false;
    }
  }
}
