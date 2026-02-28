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
})
export class QueueGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  handleEvent(
    @MessageBody() shop_id: string,
    @ConnectedSocket() client: Socket,
  ): string {
    client.join(shop_id);
    console.log(`Client joined shop room: ${shop_id}`);
    return `Joined shop room: ${shop_id}`;
  }

  notifyQueueUpdate(shopId: string) {
    this.server.to(shopId).emit('freeTable', {
      message: 'A table has been freed. Please check the queue status.',
    });
  }
}
