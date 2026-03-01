import { Module } from '@nestjs/common';
import { Queues, QueueSchema } from '../schemas/Queues.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { QueuesController } from './queues.controller';
import { QueuesService } from './queues.service';
import { TableStatus, TableStatusSchema } from '../schemas/TableStatus.schema';
import { Shops, ShopsSchema } from '../schemas/Shops.schema';
import { TableTypes, TableTypesSchema } from '../schemas/TableTypes.schema';
import {
  QueueHistory,
  QueueHistorySchema,
} from '../schemas/QueueHistory.schema';
import { Customers, CustomersSchema } from '../schemas/Customers.schema';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { QueueGateway } from './queue.gateway';
import { QueueNotificationService } from './queue-notification.service';

@Module({
  imports: [
    AuthModule,
    EmailModule,
    MongooseModule.forFeature([
      { name: Queues.name, schema: QueueSchema },
      { name: TableStatus.name, schema: TableStatusSchema },
      { name: Shops.name, schema: ShopsSchema },
      { name: TableTypes.name, schema: TableTypesSchema },
      { name: QueueHistory.name, schema: QueueHistorySchema },
      { name: Customers.name, schema: CustomersSchema },
    ]),
  ],
  controllers: [QueuesController],
  providers: [QueuesService, QueueGateway, QueueNotificationService],
})
export class QueuesModule {}
