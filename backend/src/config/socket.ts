import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from './env';

export let io: Server;

export function initSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: { origin: env.CORS_ORIGIN, credentials: true }
  });

  io.on('connection', (socket) => {
    socket.on('join:outlet', (outletId: string) => socket.join(`outlet:${outletId}`));
  });

  return io;
}
