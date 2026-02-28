import { Injectable, NotFoundException } from '@nestjs/common';
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
  ) {}

  async createQueue(queueData: queueData) {
    console.log('Creating queue with data:', queueData);
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
    console.log('totalTablesDoc', totalTablesDoc);

    const totalTables = totalTablesDoc?.capacity || 0;

    const occupiedTables = await this.tableStatusModel.countDocuments({
      shop_id: queueData.shop_id,
      table_type_id: queueData.table_type_id,
      isActive: true,
    });
    console.log('totalTables', totalTables);
    console.log('occupiedTables', occupiedTables);

    const occupiedTblAtQueue = await this.queuesModel.countDocuments({
      shop_id: queueData.shop_id,
      table_type_id: queueData.table_type_id,
      status: { $in: ['Ready to seat', 'qr-scanned', 'seated'] },
    });
    console.log('occupiedTblAtQueue', occupiedTblAtQueue);
    const hasAvailableTable =
      occupiedTables < totalTables && occupiedTblAtQueue < totalTables;

    let estimatedWaitTime = 0;
    let queueNumber = 0;
    let status = 'Ready to seat';

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
    });

    const savedQueue = await newQueue.save();

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
    const queue = await this.queuesModel.findById(queueId);
    if (!queue) {
      throw new NotFoundException('Queue not found');
    }

    queue.queue_qr = queueQr;
    queue.status = 'qr-scanned';
    queue.estimated_wait_time = 0;
    await queue.save();

    // TODO: Send notification to customer (SMS/Push/Email)
    console.log(
      `Notification sent to customer for queue ${queue.queue_number}`,
    );
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
      },
      { new: true },
    );

    if (!queue) {
      throw new NotFoundException('Queue not found');
    }

    if (!queue.queue_qr) {
      throw new Error('QR code not generated yet.');
    }

    // 🔥 Run these in parallel
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

    // 🔥 Optional: remove this if frontend already has data
    return queue; // instead of getQueueById()
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
        },
        {
          session,
          sort: { queue_number: 1 },
          new: true,
        },
      );

      await session.commitTransaction();
      session.endSession();

      if (queue) {
        this.queueGateway.notifyQueueUpdate(queue.shop_id);
      }
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
    console.log('Fetching table status for shop:', shopId);
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

  async checkNearbyQueues(shopId: string) {
    const waitingQueues = await this.queuesModel
      .find({
        shop_id: new Types.ObjectId(shopId) as any,
        status: 'waiting',
        notification_sent: false,
      })
      .sort({ queue_number: 1 })
      .limit(3); // Check top 3 waiting

    const readyCount = await this.queuesModel.countDocuments({
      shop_id: new Types.ObjectId(shopId) as any,
      status: { $in: ['ready', 'seated'] },
    });

    // If less than 3 people are ready/seated, notify the next ones
    const notifyCount = Math.max(0, 3 - readyCount);
    const queuesToNotify = waitingQueues.slice(0, notifyCount);

    return queuesToNotify.map((queue) => ({
      queue_id: queue._id,
      queue_number: queue.queue_number,
      customer_id: queue.customer_id,
      should_notify: true,
    }));
  }
}
