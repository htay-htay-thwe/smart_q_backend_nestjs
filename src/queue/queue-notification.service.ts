import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queues } from '../schemas/Queues.schema';
import { Customers } from '../schemas/Customers.schema';
import { Shops } from '../schemas/Shops.schema';
import { QueueGateway } from './queue.gateway';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class QueueNotificationService {
  private readonly logger = new Logger(QueueNotificationService.name);

  constructor(
    @InjectModel(Queues.name) private queuesModel: Model<Queues>,
    @InjectModel(Customers.name) private customersModel: Model<Customers>,
    @InjectModel(Shops.name) private shopsModel: Model<Shops>,
    private queueGateway: QueueGateway,
    private firebaseService: FirebaseService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkWaitTimes() {
    this.logger.debug('Checking queue wait times...');

    const waitingQueues = await this.queuesModel
      .find({ status: 'waiting', estimated_wait_time: { $gt: 0 } })
      .lean();

    for (const queue of waitingQueues) {
      const createdAt = (queue as any).createdAt as Date;
      if (!createdAt) continue;

      const elapsedMinutes = Math.floor(
        (Date.now() - new Date(createdAt).getTime()) / 60_000,
      );
      const remaining = queue.estimated_wait_time - elapsedMinutes;

      // Skip if wait time has already passed
      if (remaining <= 0) continue;

      // Determine which threshold to fire (only once per threshold).
      // When a lower threshold fires, mark ALL higher ones as sent too
      // so the next cron tick doesn't re-fire them.
      let threshold: 20 | 10 | 5 | null = null;
      let updateFlags: Partial<
        Record<'notified_20min' | 'notified_10min' | 'notified_5min', boolean>
      > = {};

      if (remaining <= 5 && !queue.notified_5min) {
        threshold = 5;
        updateFlags = {
          notified_5min: true,
          notified_10min: true,
          notified_20min: true,
        };
      } else if (remaining <= 10 && !queue.notified_10min) {
        threshold = 10;
        updateFlags = { notified_10min: true, notified_20min: true };
      } else if (remaining <= 20 && !queue.notified_20min) {
        threshold = 20;
        updateFlags = { notified_20min: true };
      }

      if (!threshold) continue;

      // Mark flags immediately to prevent duplicate sends on the next tick
      await this.queuesModel.updateOne({ _id: queue._id }, updateFlags);

      await this.sendThresholdNotification(queue, threshold, remaining);
    }
  }

  private async sendThresholdNotification(
    queue: any,
    threshold: 5 | 10 | 20,
    remaining: number,
  ) {
    const [customer, shop] = await Promise.all([
      this.customersModel
        .findById(queue.customer_id)
        .select('name email fcmToken')
        .lean(),
      this.shopsModel.findById(queue.shop_id).select('name').lean(),
    ]);

    if (!customer || !shop) return;

    let title: string;
    let message: string;

    if (threshold <= 5) {
      title = '🚨 Your table is almost ready!';
      message = `Queue #${queue.queue_number} — Please head to ${shop.name} right now. Your table will be assigned very shortly!`;
    } else if (threshold <= 10) {
      title = '⏰ ~10 minutes remaining';
      message = `Queue #${queue.queue_number} — Start making your way to ${shop.name}. You're almost up!`;
    } else {
      title = '⏳ ~20 minutes remaining';
      message = `Queue #${queue.queue_number} — Please stay near ${shop.name}. Your table will be ready soon.`;
    }

    this.logger.log(
      `Notifying customer ${customer._id} — threshold: ${threshold}min — queue #${queue.queue_number}`,
    );

    // 1. Socket.io push (if customer app is connected) if use socket.io, can send to specific customer room like this:
    // this.queueGateway.notifyCustomer(queue.customer_id.toString(), {
    //   title,
    //   message,
    //   remaining_minutes: remaining,
    // });

    // 2. FCM push (works even when app is closed/background)
    if ((customer as any).fcmToken) {
      await this.firebaseService.sendPushNotification(
        (customer as any).fcmToken,
        title,
        message,
        { remaining_minutes: String(remaining) },
      );
    }
  }
}
