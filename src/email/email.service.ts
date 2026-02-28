import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  async sendVerificationCode(email: string, code: string) {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail.setDataResidency('global');
    // uncomment the above line if you are sending mail using a regional EU subuser

    const msg = {
      to: email, // Change to your recipient
      from: process.env.SENDGRID_SENDER_EMAIL, // Change to your verified sender
      subject: 'Email Verification Code',
      text: `Your verification code is: ${code}`,
      html: `<strong>Your verification code is: ${code}</strong>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent');
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
