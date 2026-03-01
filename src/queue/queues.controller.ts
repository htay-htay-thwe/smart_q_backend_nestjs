import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { QueuesService } from './queues.service';
import { QueueNotificationService } from './queue-notification.service';
import { queueData } from './dtos/queueData.dto';
import { GenerateQrDto } from './dtos/generateQr.dto';
import { AssignTableDto } from './dtos/assignTable.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/queues')
export class QueuesController {
  constructor(
    private queuesService: QueuesService,
    private queueNotificationService: QueueNotificationService,
  ) {}

  @Post('create')
  async createQueue(@Body() queueData: queueData) {
    const savedQueue = await this.queuesService.createQueue(queueData);
    const populatedQueue = await this.queuesService.getQueueById(
      savedQueue._id.toString(),
    );
    return { data: populatedQueue, message: 'Queue created successfully' };
  }

  @Get('all')
  async getAllQueues() {
    const queues = await this.queuesService.getAllQueues();
    return { data: queues };
  }

  @Get('shop/:shopId')
  async getQueuesByShop(@Param('shopId') shopId: string) {
    const queues = await this.queuesService.getQueuesByShop(shopId);
    return { data: queues };
  }

  @Get('customer/:customerId')
  async getQueuesByCustomer(@Param('customerId') customerId: string) {
    const queues = await this.queuesService.getQueuesByCustomer(customerId);
    return { data: queues };
  }

  @Get('check-nearby/:shopId')
  async checkNearbyQueues(@Param('shopId') shopId: string) {
    const nearbyQueues = await this.queuesService.checkNearbyQueues(shopId);
    return {
      data: nearbyQueues,
      message: 'Queues ready for notification',
    };
  }

  @Patch('generate-qr')
  async generateQrCode(@Body() generateQrData: GenerateQrDto) {
    const queue = await this.queuesService.generateQrCode(
      generateQrData.queue_id,
      generateQrData.queue_qr,
    );
    return {
      data: queue,
      message: 'QR code generated and notification sent to customer',
    };
  }

  @Patch('assign-table')
  async assignTable(@Body() assignTableData: AssignTableDto) {
    const queue = await this.queuesService.assignTable(assignTableData);
    return { data: queue, message: 'Table assigned successfully' };
  }

  @Get('get-table-status/:shopId')
  async getTableStatus(@Param('shopId') shopId: string) {
    const tableStatus = await this.queuesService.getTableStatus(shopId);
    return { data: tableStatus };
  }

  @Get('getQueue-history/:shopId')
  async getQueueHistoryByShop(@Param('shopId') shopId: string) {
    const history = await this.queuesService.getQueueHistoryByShop(shopId);
    return history;
  }

  @Patch('free-table')
  async freeTableAndUpdateQueue(
    @Body() body: { shop_id: string; table_no: string; table_type_id: string },
  ) {
    const { shop_id, table_no, table_type_id } = body;
    const result = await this.queuesService.freeTableAndUpdateQueue(
      shop_id,
      table_no,
      table_type_id,
    );
    return {
      data: result,
      message: 'Table freed and next customer updated',
    };
  }

  @Get(':id')
  async getQueueById(@Param('id') id: string) {
    const queue = await this.queuesService.getQueueById(id);
    return { data: queue };
  }

  /** DEV ONLY — manually trigger the cron wait-time check immediately */
  @Post('trigger-cron')
  async triggerCronNow() {
    await this.queueNotificationService.checkWaitTimes();
    return { message: 'Cron check executed' };
  }

  /** DEV ONLY — set a queue's remaining time to a desired value (resets notification flags) */
  @Post('set-remaining/:queueId')
  async setRemainingTime(
    @Param('queueId') queueId: string,
    @Body() body: { remaining_minutes: number },
  ) {
    await this.queuesService.setRemainingTime(queueId, body.remaining_minutes);
    return { message: `Queue ${queueId} remaining set to ~${body.remaining_minutes} min` };
  }

  /** DEV ONLY — simulate a threshold alert to a specific customer */
  @Post('test-customer-notify')
  async testCustomerNotify(
    @Body()
    body: {
      customer_id: string;
      queue_number: number;
      shop_name: string;
      remaining_minutes: number;
    },
  ) {
    const { customer_id, queue_number, shop_name, remaining_minutes } = body;
    await this.queuesService.testCustomerNotify(
      customer_id,
      queue_number,
      shop_name,
      remaining_minutes,
    );
    return { message: `Alert sent to customer ${customer_id}` };
  }
}
