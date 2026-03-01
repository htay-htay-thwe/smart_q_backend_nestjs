import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
})
export class QueueGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  handleEvent(
    @MessageBody() shop_id: string,
    @ConnectedSocket() client: Socket,
  ): string {
    console.log('Received events from:', client.id);
    console.log('Shop ID received:', shop_id);

    client.join(shop_id.toString());

    console.log('Rooms of this client:', client.rooms);
    return `Joined shop room: ${shop_id}`;
  }

  // Customer app calls this with their customerId to receive queue alerts
  @SubscribeMessage('joinCustomerRoom')
  handleCustomerRoom(
    @MessageBody() customer_id: string,
    @ConnectedSocket() client: Socket,
  ): string {
    client.join(`customer:${customer_id}`);
    return `Joined customer room: ${customer_id}`;
  }

  notifyQueueUpdate(
    shopId: string,
    payload?: { table_type_id?: string; table_type_name?: string | null },
  ) {
    console.log('Emitting to room:', JSON.stringify(shopId));

    console.log(
      'Existing rooms:',
      Array.from(this.server.sockets.adapter.rooms.keys()),
    );
    this.server.to(shopId).emit('freeTable', {
      table_type_id: payload?.table_type_id ?? null,
      table_type_name: payload?.table_type_name ?? null,
    });
  }

  notifyCustomerQueue(
    shopId: string,
    payload?: {
      table_type_id?: string;
      table_type_name?: string | null;
      customer_name?: string;
    },
  ) {
    console.log('Emitting to room:', JSON.stringify(shopId));

    console.log(
      'Existing rooms:',
      Array.from(this.server.sockets.adapter.rooms.keys()),
    );
    this.server.to(shopId).emit('newCustomerQueue', {
      table_type_id: payload?.table_type_id ?? null,
      table_type_name: payload?.table_type_name ?? null,
      customer_name: payload?.customer_name ?? null,
    });
  }

  // Push a wait-time alert to a specific customer's socket room
  notifyCustomer(
    customerId: string,
    payload: {
      title: string;
      message: string;
      remaining_minutes: number;
    },
  ) {
    this.server.to(`customer:${customerId}`).emit('queueAlert', payload);
  }
}
