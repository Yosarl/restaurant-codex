import { io } from 'socket.io-client';

const SOCKET_BASE = import.meta.env.VITE_SOCKET_BASE || 'http://localhost:5000';

export const socket = io(SOCKET_BASE, { autoConnect: false });
