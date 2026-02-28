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
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: Queues.name,
        schema: QueueSchema,
      },
      { name: TableStatus.name, schema: TableStatusSchema },
      { name: Shops.name, schema: ShopsSchema },
      { name: TableTypes.name, schema: TableTypesSchema },
      { name: QueueHistory.name, schema: QueueHistorySchema },
    ]),
  ],
  controllers: [QueuesController],
  providers: [QueuesService],
})
export class QueuesModule {}
