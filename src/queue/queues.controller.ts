import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { QueuesService } from './queues.service';
import { queueData } from './dtos/queueData.dto';
import { GenerateQrDto } from './dtos/generateQr.dto';
import { AssignTableDto } from './dtos/assignTable.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CacheTTL } from '@nestjs/cache-manager/dist/decorators/cache-ttl.decorator';
import { CacheInterceptor } from '@nestjs/cache-manager/dist/interceptors/cache.interceptor';

@UseGuards(JwtAuthGuard)
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
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  async getAllQueues() {
    const queues = await this.queuesService.getAllQueues();
    return { data: queues };
  }

  @Get('shop/:shopId')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  async getQueuesByShop(@Param('shopId') shopId: string) {
    const queues = await this.queuesService.getQueuesByShop(shopId);
    return { data: queues };
  }

  @Get('customer/:customerId')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  async getQueuesByCustomer(@Param('customerId') customerId: string) {
    const queues = await this.queuesService.getQueuesByCustomer(customerId);
    return { data: queues };
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
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  async getTableStatus(@Param('shopId') shopId: string) {
    const tableStatus = await this.queuesService.getTableStatus(shopId);
    return { data: tableStatus };
  }

  @Get('getQueue-history/:shopId')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
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
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30)
  async getQueueById(@Param('id') id: string) {
    const queue = await this.queuesService.getQueueById(id);
    return { data: queue };
  }
}
