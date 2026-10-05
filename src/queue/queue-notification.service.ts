import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queues } from '../schemas/Queues.schema';
import { Customers } from '../schemas/Customers.schema';
import { Shops } from '../schemas/Shops.schema';
import { QueueGateway } from './queue.gateway';
import { FirebaseService } from '../firebase/firebase.service';
import { Notification } from '../schemas/Notification.schema';
import { QueueHistory } from '../schemas/QueueHistory.schema';

@Injectable()
export class QueueNotificationService {
  private readonly logger = new Logger(QueueNotificationService.name);

  constructor(
    @InjectModel(Queues.name) private queuesModel: Model<Queues>,
    @InjectModel(Customers.name) private customersModel: Model<Customers>,
    @InjectModel(Shops.name) private shopsModel: Model<Shops>,
    @InjectModel(Notification.name)
    private notificationsModel: Model<Notification>,
    @InjectModel(QueueHistory.name)
    private queueHistoryModel: Model<QueueHistory>,
    private queueGateway: QueueGateway,
    private firebaseService: FirebaseService,
  ) {}

  async createAndSend(input: {
    customerId: string;
    queueId?: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, string>;
  }) {
    const notification = await this.notificationsModel.create({
      customer_id: input.customerId,
      queue_id: input.queueId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data ?? {},
      isRead: false,
    });
    const payload = {
      id: notification._id.toString(),
      type: input.type,
      title: input.title,
      message: input.message,
      queue_id: input.queueId,
      data: input.data,
      createdAt: (notification as any).createdAt,
    };
    this.queueGateway.notifyCustomer(input.customerId, payload);
    const customer = await this.customersModel
      .findById(input.customerId)
      .select('fcmToken pushTokens')
      .lean();
    const tokens = Array.from(new Set([
      ...((customer as any)?.pushTokens ?? []),
      (customer as any)?.fcmToken,
    ].filter(Boolean))) as string[];
    for (const token of tokens) {
      await this.firebaseService.sendPushNotification(token, input.title, input.message, {
        type: input.type,
        notificationType: input.type,
        queueId: input.queueId ?? '',
        ...(input.data ?? {}),
      });
    }
    return notification;
  }

  list(customerId: string, page = 1, limit = 30) {
    return this.notificationsModel
      .find({ customer_id: customerId })
      .sort({ createdAt: -1 })
      .skip((Math.max(1, page) - 1) * Math.min(100, limit))
      .limit(Math.min(100, limit))
      .lean();
  }

  unreadCount(customerId: string) {
    return this.notificationsModel.countDocuments({ customer_id: customerId, isRead: false });
  }

  markRead(customerId: string, notificationId: string) {
    return this.notificationsModel.findOneAndUpdate(
      { _id: notificationId, customer_id: customerId },
      { isRead: true },
      { new: true },
    );
  }

  async markAllRead(customerId: string) {
    const result = await this.notificationsModel.updateMany(
      { customer_id: customerId, isRead: false },
      { isRead: true },
    );
    return { updated: result.modifiedCount };
  }

  async remove(customerId: string, notificationId: string) {
    await this.notificationsModel.deleteOne({ _id: notificationId, customer_id: customerId });
    return { deleted: true };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkWaitTimes() {
    this.logger.debug('Checking queue wait times...');
    await this.cancelExpiredNoShows();

    const waitingQueues = await this.queuesModel
      .find({ status: 'waiting', estimated_wait_time: { $gt: 0 } })
      .lean();

    for (const queue of waitingQueues) {
      const estimateUpdatedAt = ((queue as any).updatedAt ?? (queue as any).createdAt) as Date;
      if (!estimateUpdatedAt) continue;

      const elapsedMinutes = Math.floor(
        (Date.now() - new Date(estimateUpdatedAt).getTime()) / 60_000,
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

  private async cancelExpiredNoShows() {
    const expired = await this.queuesModel
      .find({ status: 'Ready to seat', noShowDeadline: { $lte: new Date() } })
      .lean();

    for (const queue of expired) {
      const updated = await this.queuesModel.findOneAndUpdate(
        { _id: queue._id, status: 'Ready to seat', noShowDeadline: { $lte: new Date() } },
        { status: 'expired', readyAt: null, noShowDeadline: null },
        { new: true },
      );
      if (!updated) continue;

      await this.queueHistoryModel.create({
        queue_number: updated.queue_number,
        table_type_id: updated.table_type_id,
        table_no: updated.table_no,
        queue_qr: updated.queue_qr,
        status: updated.status,
        userRequirements: updated.userRequirements,
        estimated_wait_time: updated.estimated_wait_time,
        notification_sent: updated.notification_sent,
        expirationReason: 'no-show',
        shop_id: updated.shop_id,
        customer_id: updated.customer_id,
        completedAt: new Date(),
      });

      await this.queuesModel.deleteOne({ _id: updated._id });

      const nextQueue = await this.queuesModel.findOneAndUpdate(
        {
          shop_id: updated.shop_id,
          table_type_id: updated.table_type_id,
          status: 'waiting',
        },
        {
          status: 'Ready to seat',
          estimated_wait_time: 0,
          readyAt: new Date(),
          noShowDeadline: new Date(Date.now() + 15 * 60_000),
        },
        { sort: { queue_number: 1 }, new: true },
      );

      await this.createAndSend({
        customerId: updated.customer_id.toString(),
        queueId: updated._id.toString(),
        type: 'QUEUE_EXPIRED',
        title: 'Queue expired',
        message: 'Your queue expired because you did not check in within 15 minutes.',
        data: { status: 'expired', reason: 'no-show' },
      });

      if (nextQueue) {
        await this.createAndSend({
          customerId: nextQueue.customer_id.toString(),
          queueId: nextQueue._id.toString(),
          type: 'QUEUE_READY',
          title: "It's your turn",
          message: 'A table is available. Please scan the shop QR within 15 minutes.',
          data: { status: 'Ready to seat' },
        });
      }

      this.queueGateway.notifyQueueExpired(updated.shop_id.toString(), {
        queue_id: updated._id.toString(),
        queue_number: updated.queue_number,
      });
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

    await this.createAndSend({
      customerId: queue.customer_id.toString(),
      queueId: queue._id.toString(),
      type: `WAIT_${threshold}_MINUTES`,
      title,
      message,
      data: { remaining_minutes: String(remaining) },
    });
  }
}
