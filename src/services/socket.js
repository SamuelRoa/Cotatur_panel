import { io } from 'socket.io-client';

const API_URL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_API_URL_PROD
  : import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const SOCKET_URL = API_URL.replace(/\/api$/, '');

let socket = null;

export function connectSocket(token) {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 3000,
  });

  socket.on('connect', () => {
    console.log('Conectado al servidor de notificaciones');
  });

  socket.on('disconnect', (reason) => {
    console.log('Desconectado del servidor de notificaciones:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('Error de conexión Socket.io:', err.message);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
