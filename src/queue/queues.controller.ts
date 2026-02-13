import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { queueData } from './dtos/queueData.dto';
import { GenerateQrDto } from './dtos/generateQr.dto';
import { AssignTableDto } from './dtos/assignTable.dto';

@Controller('api/queues')
export class QueuesController {
  constructor(private queuesService: QueuesService) {}

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

  @Get(':id')
  async getQueueById(@Param('id') id: string) {
    const queue = await this.queuesService.getQueueById(id);
    return { data: queue };
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
}
