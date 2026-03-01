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
      subject: 'Email Verification Code - SmartQ',
      text: `Your verification code is: ${otp}`,
      html: `<strong>Your verification code is: <h1>${otp}</h1></strong>`,
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

  async sendQueueAlert(
    email: string,
    customerName: string,
    queueNumber: number,
    shopName: string,
    remainingMinutes: number,
  ) {
    let subject: string;
    let urgency: string;
    let color: string;
    let advice: string;

    if (remainingMinutes <= 5) {
      subject = `🚨 Your table is almost ready! — SmartQ`;
      urgency = 'Almost Ready';
      color = '#e53e3e';
      advice = 'Please make your way to the restaurant <strong>right now</strong>. Your table will be assigned very shortly!';
    } else if (remainingMinutes <= 10) {
      subject = `⏰ ~10 minutes until your table — SmartQ`;
      urgency = '~10 Minutes Left';
      color = '#dd6b20';
      advice = 'Please start heading to the restaurant. You should arrive soon!';
    } else {
      subject = `⏳ ~20 minutes until your table — SmartQ`;
      urgency = '~20 Minutes Left';
      color = '#3182ce';
      advice = 'We recommend staying near the restaurant. Your table will be ready soon.';
    }

    const html = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
        <div style="background:${color};padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:22px">${urgency}</h1>
        </div>
        <div style="padding:24px">
          <p style="font-size:16px">Hi <strong>${customerName}</strong>,</p>
          <p style="font-size:15px">Your queue <strong>#${queueNumber}</strong> at <strong>${shopName}</strong> has approximately <strong>${remainingMinutes} minutes</strong> remaining.</p>
          <p style="font-size:15px">${advice}</p>
          <div style="background:#f7fafc;border-radius:8px;padding:16px;margin-top:16px;text-align:center">
            <span style="font-size:28px;font-weight:bold;color:${color}">${remainingMinutes} min</span>
            <p style="margin:4px 0 0;color:#718096;font-size:13px">Estimated time remaining</p>
          </div>
        </div>
        <div style="padding:16px 24px;border-top:1px solid #e2e8f0;text-align:center;color:#a0aec0;font-size:12px">
          SmartQ — Smart Queue System © 2026
        </div>
      </div>`;

    try {
      await this.sgMail.send({
        to: email,
        from: process.env.SENDGRID_SENDER_EMAIL,
        subject,
        html,
        text: `Hi ${customerName}, your queue #${queueNumber} at ${shopName} has ~${remainingMinutes} minutes remaining. ${advice}`,
      });
      return true;
    } catch (error) {
      console.error('SendGrid queue alert error:', error.response?.body || error);
      return false;
    }
  }
}
