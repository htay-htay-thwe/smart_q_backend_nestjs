import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly apiKey: string;
  private readonly senderEmail: string;
  private readonly senderName: string;

  constructor() {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL;
    if (!apiKey || !senderEmail) {
      throw new Error(
        'BREVO_API_KEY and SENDER_EMAIL are not configured',
      );
    }

    this.apiKey = apiKey;
    this.senderEmail = senderEmail;
    this.senderName = process.env.SENDER_NAME?.trim() || 'Smart Queue System';
  }

  async sendVerificationCode(email: string, otp: string) {
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            email: this.senderEmail,
            name: this.senderName,
          },
          to: [{ email }],
          subject: 'Email Verification Code - SmartQ',
          textContent: `Your verification code is: ${otp}`,
          htmlContent: `<strong>Your verification code is:</strong><h1>${otp}</h1>`,
        }),
      });

      if (!response.ok) {
        console.error('Brevo API Error:', {
          status: response.status,
          statusText: response.statusText,
        });
        return false;
      }

      console.log('Email sent successfully through Brevo');
      return true;
    } catch (error) {
      console.error('Brevo API Error:', {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}
