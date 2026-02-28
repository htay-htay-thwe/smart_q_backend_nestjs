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

  notifyQueueUpdate(shopId: string) {
    console.log(`Notifying clients in shop room: ${shopId} about queue update`);
    this.server.to(shopId).emit('freeTable', {
      message: 'A table has been freed. Please check the queue status.',
    });
  }
}
