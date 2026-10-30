import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class EmailService {
  private readonly oauthClient: OAuth2Client;
  private readonly user: string;
  private readonly senderName: string;

  constructor() {
    const user = process.env.GMAIL_USER;
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (!user || !clientId || !clientSecret || !refreshToken) {
      throw new Error(
        'GMAIL_USER, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN are not configured',
      );
    }

    this.user = user;
    this.senderName = process.env.GMAIL_FROM_NAME?.trim() || 'SmartQ';
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
    this.oauthClient.setCredentials({ refresh_token: refreshToken });
  }

  async sendVerificationCode(email: string, otp: string) {
    try {
      const accessToken = await this.oauthClient.getAccessToken();
      if (!accessToken.token) {
        throw new Error('Google OAuth access token was not returned');
      }

      const rawMessage = [
        `From: ${this.senderName} <${this.user}>`,
        `To: ${email}`,
        'Subject: Email Verification Code - SmartQ',
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        '',
        `<strong>Your verification code is:</strong><h1>${otp}</h1>`,
      ].join('\r\n');
      const encodedMessage = Buffer.from(rawMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encodedMessage }),
        },
      );

      if (!response.ok) {
        console.error('Gmail API Error:', {
          status: response.status,
          statusText: response.statusText,
        });
        return false;
      }

      const data = (await response.json()) as { id?: string };
      if (!data.id) {
        console.error('Gmail API Error: no message ID returned');
        return false;
      }

      console.log('Email sent successfully through Gmail API');
      return true;
    } catch (error) {
      console.error('Gmail API Error:', {
        name: error instanceof Error ? error.name : 'UnknownError',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }
}
