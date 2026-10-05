import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);

  onModuleInit() {
    if (!admin.apps.length) {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
        /\\n/g,
        '\n',
      );

      if (!projectId || !clientEmail || !privateKey) {
        this.logger.warn(
          'Firebase env vars not set — push notifications disabled. ' +
            'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY on Render.',
        );
        return;
      }

      try {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
        this.logger.log('Firebase Admin initialized');
      } catch (error) {
        this.logger.error(`Firebase init failed: ${error.message}`);
      }
    }
  }

  async sendPushNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<void> {
    const channelId = data?.notificationType === 'QUEUE_READY' || data?.notificationType === 'QR_SCANNED'
      ? 'queue-ready'
      : 'queue-updates';
    if (/^(ExponentPushToken|ExpoPushToken)\[.+\]$/.test(fcmToken)) {
      try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ to: fcmToken, title, body, data: data ?? {}, sound: 'default', priority: 'high', channelId }),
        });
        if (!response.ok) throw new Error(`Expo Push returned ${response.status}`);
        this.logger.log(`Expo push sent to token: ${fcmToken.slice(0, 24)}...`);
      } catch (error) {
        this.logger.error(`Expo push failed: ${error.message}`);
      }
      return;
    }
    if (!admin.apps.length) {
      this.logger.warn('Firebase not initialized — skipping push notification');
      return;
    }
    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
        data: data ?? {},
        android: {
          priority: 'high',
          notification: { sound: 'default', channelId },
        },
        apns: {
          payload: {
            aps: { sound: 'default', badge: 1 },
          },
        },
      });
      this.logger.log(`FCM push sent to token: ${fcmToken.slice(0, 20)}...`);
    } catch (error) {
      this.logger.error(`FCM send failed: ${error.message}`);
    }
  }
}
