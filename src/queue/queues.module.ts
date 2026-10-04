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
import { QueueGateway } from './queue.gateway';
import { QueueNotificationService } from './queue-notification.service';
import { CacheInterceptor } from '@nestjs/cache-manager/dist/interceptors/cache.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core/constants';
import { CacheModule } from '@nestjs/cache-manager/dist/cache.module';
import { Notification, NotificationSchema } from '../schemas/Notification.schema';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Queues.name, schema: QueueSchema },
      { name: TableStatus.name, schema: TableStatusSchema },
      { name: Shops.name, schema: ShopsSchema },
      { name: TableTypes.name, schema: TableTypesSchema },
      { name: QueueHistory.name, schema: QueueHistorySchema },
      { name: Customers.name, schema: CustomersSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [QueuesController, NotificationsController],
  providers: [QueuesService, QueueGateway, QueueNotificationService,{
          provide: APP_INTERCEPTOR,
          useClass: CacheInterceptor,
        }],
})
export class QueuesModule {}
