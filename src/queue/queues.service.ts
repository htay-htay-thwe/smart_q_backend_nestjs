import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Queues } from '../schemas/Queues.schema';
import { queueData } from './dtos/queueData.dto';
import { Model, Types } from 'mongoose';
import { TableStatus } from '../schemas/TableStatus.schema';
import { Shops } from '../schemas/Shops.schema';
import { TableTypes } from '../schemas/TableTypes.schema';
import { AssignTableDto } from './dtos/assignTable.dto';
import { QueueHistory } from '../schemas/QueueHistory.schema';
import { QueueGateway } from './queue.gateway';
import { QueueNotificationService } from './queue-notification.service';

@Injectable()
export class QueuesService {
  private readonly AVERAGE_SERVICE_TIME = 60; // 30 minutes per customer

  constructor(
    @InjectModel(Queues.name) private queuesModel: Model<Queues>,
    @InjectModel(TableStatus.name) private tableStatusModel: Model<TableStatus>,
    @InjectModel(Shops.name) private shopsModel: Model<Shops>,
    @InjectModel(TableTypes.name) private tableTypesModel: Model<TableTypes>,
    @InjectModel(QueueHistory.name)
    private queueHistoryModel: Model<QueueHistory>,
    private queueGateway: QueueGateway,
    private queueNotifications: QueueNotificationService,
  ) {}

  async createQueue(queueData: queueData) {
    console.log('Creating queue with data:', queueData);
    const existingQueue = await this.queuesModel
      .findOne({
        customer_id: queueData.customer_id,
      })
      .select('_id status queue_number')
      .lean();

    if (existingQueue) {
      throw new ConflictException(
        'You already have an active queue. Complete or cancel it before joining another queue.',
      );
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // First, let's verify the table type exists
    const allTableTypes = await this.tableTypesModel
      .find({ shopId: queueData.shop_id })
      .lean();
    console.log('All table types for this shop:', allTableTypes);

    const totalTablesDoc = await this.tableTypesModel
      .findOne({
        _id: queueData.table_type_id,
        shopId: queueData.shop_id,
      })
      .select('capacity');
    const totalTables = totalTablesDoc?.capacity || 0;
    const occupiedTables = await this.tableStatusModel.countDocuments({
      shop_id: queueData.shop_id,
      table_type_id: queueData.table_type_id,
      isActive: true,
    });

    const occupiedTblAtQueue = await this.queuesModel.countDocuments({
      shop_id: queueData.shop_id,
      table_type_id: queueData.table_type_id,
      status: { $in: ['Ready to seat', 'qr-scanned', 'seated'] },
    });
    const hasAvailableTable =
      occupiedTables < totalTables && occupiedTblAtQueue < totalTables;

    let estimatedWaitTime = 0;
    let queueNumber = 0;
    let status = 'Ready to seat';
    const readyAt = status === 'Ready to seat' ? new Date() : null;
    const noShowDeadline = readyAt ? new Date(readyAt.getTime() + 15 * 60_000) : null;

    if (!hasAvailableTable) {
      const waitingAhead = await this.queuesModel.countDocuments({
        shop_id: queueData.shop_id,
        table_type_id: queueData.table_type_id,
        status: 'waiting',
      });

      // The new position in the queue (including this customer)
      const position = waitingAhead + 1;
      // Use totalTables as tableCount
      estimatedWaitTime =
        Math.ceil(position / totalTables) * this.AVERAGE_SERVICE_TIME;
      status = 'waiting';

      const lastQueue = await this.queuesModel
        .findOne({
          shop_id: queueData.shop_id,
          table_type_id: queueData.table_type_id,
          createdAt: { $gte: startOfDay },
        })
        .sort({ queue_number: -1 })
        .select('queue_number')
        .lean();
      console.log('lastQueue', lastQueue);

      queueNumber = lastQueue ? lastQueue.queue_number + 1 : 1;
    }

    const newQueue = new this.queuesModel({
      ...queueData,
      queue_number: queueNumber,
      queue_qr: null,
      status,
      estimated_wait_time: estimatedWaitTime,
      notification_sent: false,
      userRequirements: queueData.userRequirements || '',
      readyAt,
      noShowDeadline,
    });

    const savedQueue = await newQueue.save();
    const shop = await this.shopsModel.findById(queueData.shop_id).select('name').lean();
    const tableType = await this.tableTypesModel
      .findById(queueData.table_type_id)
      .select('type')
      .lean();
    this.queueGateway.notifyCustomerQueue(queueData.shop_id.toString(), {
      table_type_id: queueData.table_type_id,
      table_type_name: tableType?.type ?? null,
    });
    await this.queueNotifications.createAndSend({
      customerId: queueData.customer_id.toString(),
      queueId: savedQueue._id.toString(),
      type: 'QUEUE_JOINED',
      title: 'Queue joined',
      message: estimatedWaitTime > 0
        ? `Estimated wait at ${shop?.name ?? 'the shop'} is about ${estimatedWaitTime} minutes.`
        : `A table is available at ${shop?.name ?? 'the shop'}. Please proceed to check in.`,
      data: { estimated_wait_minutes: String(estimatedWaitTime), status },
    });
    return savedQueue;
  }

  async getAllQueues() {
    return this.queuesModel
      .find()
      .populate('customer_id')
      .populate('shop_id')
      .sort({ queue_number: 1 })
      .exec();
  }

  async getQueueById(id: string) {
    return this.queuesModel
      .findById(id)
      .populate('customer_id')
      .populate('shop_id')
      .exec();
  }

  async getQueuesByShop(shopId: string) {
    return this.queuesModel
      .find({ shop_id: new Types.ObjectId(shopId) as any })
      .populate('customer_id')
      .populate('shop_id')
      .sort({ queue_number: 1 })
      .exec();
  }

  async getQueuesByCustomer(customerId: string) {
    return this.queuesModel
      .find({ customer_id: new Types.ObjectId(customerId) as any })
      .populate('customer_id')
      .populate('shop_id')
      .sort({ createdAt: -1 })
      .exec();
  }

  async generateQrCode(queueId: string, queueQr: string) {
    if (!Types.ObjectId.isValid(queueId)) {
      throw new BadRequestException(
        'queue_id must be a valid MongoDB queue _id; send the generated UUID as queue_qr',
      );
    }

    const queue = await this.queuesModel.findById(queueId);
    if (!queue) {
      throw new NotFoundException('Queue not found');
    }

    queue.queue_qr = queueQr;
    queue.status = 'qr-scanned';
    queue.estimated_wait_time = 0;
    queue.readyAt = null;
    queue.noShowDeadline = null;
    await queue.save();
    await this.queueNotifications.createAndSend({
      customerId: queue.customer_id.toString(),
      queueId: queue._id.toString(),
      type: 'QR_SCANNED',
      title: 'Check-in confirmed',
      message: 'Your QR was scanned successfully. Please wait to be seated.',
      data: { status: 'qr-scanned' },
    });
    console.log(`QR Code generated: ${queueQr}`);

    return this.getQueueById(queueId);
  }

  async assignTable(assignTableData: AssignTableDto) {
    const { queue_id, table_no, table_type_id, shop_id } = assignTableData;

    // 🔥 Single update instead of find + save
    const queue = await this.queuesModel.findByIdAndUpdate(
      queue_id,
      {
        table_no,
        table_type_id,
        shop_id,
        status: 'seated',
        readyAt: null,
        noShowDeadline: null,
      },
      { new: true },
    );

    if (!queue) {
      throw new NotFoundException('Queue not found');
    }

    if (!queue.queue_qr) {
      throw new Error('QR code not generated yet.');
    }
    await Promise.all([
      this.tableStatusModel.create({
        queue_id,
        shop_id,
        table_no,
        table_type_id,
        isActive: true,
      }),
      this.queueHistoryModel.create({
        ...queue.toObject(),
        completedAt: new Date(),
      }),
    ]);
    await this.queueNotifications.createAndSend({
      customerId: queue.customer_id.toString(),
      queueId: queue._id.toString(),
      type: 'SEATED',
      title: "You've been seated",
      message: 'Your table is ready and service has started. Enjoy your visit!',
      data: { status: 'seated', table_no: String(table_no) },
    });
    return queue;
  }

  async freeTableAndUpdateQueue(
    shop_id: string,
    table_no: string,
    table_type_id: string,
  ) {
    const session = await this.tableStatusModel.db.startSession();
    session.startTransaction();
    try {
      const tableStatus = await this.tableStatusModel
        .findOneAndDelete({
          shop_id,
          table_no,
          table_type_id,
          isActive: true,
        })
        .session(session);

      if (!tableStatus) {
        throw new NotFoundException('Active table not found');
      }

      const queue = await this.queuesModel
        .findByIdAndUpdate(
          tableStatus.queue_id,
          { status: 'finished' },
          { new: true },
        )
        .session(session);

      if (queue) {
        const { _id, ...queueData } = queue.toObject();
        await this.queueHistoryModel.create(
          [
            {
              ...queueData,
              completedAt: new Date(),
            },
          ],
          { session },
        );

        await this.queuesModel.deleteOne({ _id: queue._id }, { session });
      }

      // 3. Find the next waiting customer in the queue
      const nextQueue = await this.queuesModel.findOneAndUpdate(
        {
          shop_id: shop_id,
          table_type_id: table_type_id,
          status: 'waiting',
        },
        {
          status: 'Ready to seat',
          estimated_wait_time: 0,
          readyAt: new Date(),
          noShowDeadline: new Date(Date.now() + 15 * 60_000),
        },
        {
          session,
          sort: { queue_number: 1 },
          new: true,
        },
      );

      await session.commitTransaction();

      if (queue) {
        await this.queueNotifications.createAndSend({
          customerId: queue.customer_id.toString(),
          queueId: queue._id.toString(),
          type: 'QUEUE_COMPLETED',
          title: 'Queue completed',
          message: 'Thanks for visiting. Your queue has been completed.',
          data: { status: 'finished' },
        });
      }
      if (nextQueue) {
        await this.queueNotifications.createAndSend({
          customerId: nextQueue.customer_id.toString(),
          queueId: nextQueue._id.toString(),
          type: 'QUEUE_READY',
          title: "It's your turn",
          message: 'Your table is ready. Please scan the shop QR when you arrive.',
          data: { status: 'Ready to seat' },
        });
      }

      // Recalculate estimated_wait_time for ALL remaining waiting customers
      // in this shop+table_type so the cron thresholds stay accurate.
      const remainingWaiting = await this.queuesModel
        .find({ shop_id, table_type_id, status: 'waiting' })
        .sort({ queue_number: 1 })
        .lean();

      const totalTables = await this.tableTypesModel
        .findById(table_type_id)
        .select('capacity')
        .lean()
        .then((doc) => doc?.capacity ?? 1);

      const AVERAGE_SERVICE_TIME = 60;
      for (let i = 0; i < remainingWaiting.length; i++) {
        const position = i + 1;
        const newWaitTime =
          Math.ceil(position / totalTables) * AVERAGE_SERVICE_TIME;
        await this.queuesModel.updateOne(
          { _id: remainingWaiting[i]._id },
          {
            estimated_wait_time: newWaitTime,
            // Reset notification flags so updated thresholds can re-fire
            notified_20min: false,
            notified_10min: false,
            notified_5min: false,
            ...(i === 0 && !remainingWaiting[i].notified_next ? { notified_next: true } : {}),
          },
        );
        if (i === 0 && !remainingWaiting[i].notified_next) {
          await this.queueNotifications.createAndSend({
            customerId: remainingWaiting[i].customer_id.toString(),
            queueId: remainingWaiting[i]._id.toString(),
            type: 'QUEUE_NEXT',
            title: "You're next",
            message: 'One queue is ahead of you. Please be ready to head to the counter.',
            data: { position: '1', estimated_wait_minutes: String(newWaitTime) },
          });
        }
        const previousWait = Number(remainingWaiting[i].estimated_wait_time || 0);
        if (previousWait > 0 && Math.abs(previousWait - newWaitTime) >= 10) {
          await this.queueNotifications.createAndSend({
            customerId: remainingWaiting[i].customer_id.toString(),
            queueId: remainingWaiting[i]._id.toString(),
            type: 'WAIT_ESTIMATE_CHANGED',
            title: 'Wait time updated',
            message: `Your estimated wait is now about ${newWaitTime} minutes.`,
            data: { estimated_wait_minutes: String(newWaitTime) },
          });
        }
      }

      const tableType = await this.tableTypesModel
        .findById(table_type_id)
        .select('type')
        .lean();

      this.queueGateway.notifyQueueUpdate(shop_id, {
        table_type_id,
        table_type_name: tableType?.type ?? null,
      });

      return {
        updatedQueue: nextQueue,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getTableStatus(shopId: string) {
    const tables = await this.tableStatusModel.find({ shop_id: shopId }).lean();
    return tables;
  }

  async getQueueHistoryByShop(shopId: string) {
    return this.queueHistoryModel
      .find({ shop_id: shopId })
      .populate('customer_id')
      .populate('shop_id')
      .sort({ completedAt: -1 })
      .exec();
  }

  async getQueueHistoryByCustomer(customerId: string) {
    return this.queueHistoryModel
      .find({ customer_id: new Types.ObjectId(customerId) as any })
      .populate('customer_id')
      .populate('shop_id')
      .sort({ completedAt: -1 })
      .exec();
  }

  async cancelQueue(queueId: string) {
    if (!Types.ObjectId.isValid(queueId)) throw new BadRequestException('Invalid queue id');
    const queue = await this.queuesModel.findById(queueId);
    if (!queue) throw new NotFoundException('Queue not found');
    queue.status = 'cancelled';
    await this.queueHistoryModel.create({ ...queue.toObject(), completedAt: new Date() });
    await this.queuesModel.deleteOne({ _id: queue._id });
    await this.queueNotifications.createAndSend({
      customerId: queue.customer_id.toString(),
      queueId: queue._id.toString(),
      type: 'QUEUE_CANCELLED',
      title: 'Queue cancelled',
      message: `Queue #${queue.queue_number} has been cancelled.`,
      data: { status: 'cancelled' },
    });
    return queue;
  }
}
