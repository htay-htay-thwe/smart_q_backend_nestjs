import { Controller, Delete, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QueueNotificationService } from './queue-notification.service';

@UseGuards(JwtAuthGuard)
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notifications: QueueNotificationService) {}

  private customerId(request: any): string {
    return String(request.user?.id ?? request.user?._id ?? request.user?.sub ?? '');
  }

  @Get()
  async list(@Req() request: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    const data = await this.notifications.list(this.customerId(request), Number(page) || 1, Number(limit) || 30);
    const unreadCount = await this.notifications.unreadCount(this.customerId(request));
    return { data, unreadCount };
  }

  @Get('unread-count')
  async unread(@Req() request: any) {
    return { data: { count: await this.notifications.unreadCount(this.customerId(request)) } };
  }

  @Patch('read-all')
  async readAll(@Req() request: any) {
    return { data: await this.notifications.markAllRead(this.customerId(request)) };
  }

  @Patch(':id/read')
  async read(@Req() request: any, @Param('id') id: string) {
    return { data: await this.notifications.markRead(this.customerId(request), id) };
  }

  @Delete(':id')
  async remove(@Req() request: any, @Param('id') id: string) {
    return { data: await this.notifications.remove(this.customerId(request), id) };
  }
}
