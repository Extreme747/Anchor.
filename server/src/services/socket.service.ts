import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { config } from '../config/index.js';

export class SocketService {
  private static io: SocketIOServer | null = null;

  static init(server: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: config.frontendUrl || '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.io.on('connection', (socket: Socket) => {
      // Client joins their organization room
      socket.on('join:org', (orgId: string) => {
        if (orgId) {
          socket.join(`org:${orgId}`);
        }
      });

      // Client joins a specific conversation thread room
      socket.on('join:lead', (leadId: string) => {
        if (leadId) {
          socket.join(`lead:${leadId}`);
        }
      });

      // Typing indicator
      socket.on('typing:start', (data: { leadId: string; userName: string }) => {
        socket.to(`lead:${data.leadId}`).emit('typing:status', {
          leadId: data.leadId,
          isTyping: true,
          userName: data.userName,
        });
      });

      socket.on('typing:stop', (data: { leadId: string }) => {
        socket.to(`lead:${data.leadId}`).emit('typing:status', {
          leadId: data.leadId,
          isTyping: false,
        });
      });
    });

    return this.io;
  }

  static getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io has not been initialized');
    }
    return this.io;
  }

  static broadcastToOrg(orgId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`org:${orgId}`).emit(event, data);
    }
  }

  static broadcastToLead(leadId: string, event: string, data: any) {
    if (this.io) {
      this.io.to(`lead:${leadId}`).emit(event, data);
    }
  }
}
