import { Injectable } from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';

@Injectable()
export class EmailService {
  private readonly brevo: BrevoClient;

  constructor() {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      throw new Error('BREVO_API_KEY is not configured');
    }
    this.brevo = new BrevoClient({ apiKey, maxRetries: 2 });
  }

  async sendVerificationCode(email: string, otp: string) {
    const from = process.env.BREVO_FROM_EMAIL;
    if (!from) {
      throw new Error('BREVO_FROM_EMAIL is not configured');
    }
    const match = from.match(/^(.*?)\s*<([^>]+)>$/);
    const sender = match
      ? { name: match[1].trim(), email: match[2].trim() }
      : { email: from.trim() };

    try {
      const data = await this.brevo.transactionalEmails.sendTransacEmail({
        to: [{ email }],
        sender,
        subject: 'Email Verification Code - SmartQ',
        textContent: `Your verification code is: ${otp}`,
        htmlContent: `<strong>Your verification code is:</strong><h1>${otp}</h1>`,
      });
      if (!data?.messageId) {
        console.error('Brevo Error: No message ID returned');
        return false;
      }
      console.log(`Email sent successfully: ${data.messageId}`);
      return true;
    } catch (error) {
      console.error('Brevo Error:', error);
      return false;
    }
  }
}
