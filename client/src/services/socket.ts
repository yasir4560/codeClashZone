import { io } from 'socket.io-client';

const socket = io('https://codeclashzone-2.onrender.com', {
  withCredentials: true,
  transports: ['websocket'],
});

export default socket;
