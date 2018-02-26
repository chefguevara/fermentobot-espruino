import openSocket from 'socket.io-client';
import shortid from 'shortid';

const socket = openSocket('http://192.168.100.104:8080');

export const emitMessage = (msg) => {
  socket.emit('message', msg);
};

export const emitClientInfo = (clientInfo) => {
  socket.emit('storeClientInfo', clientInfo);
};

export const subscribeToConnect = (cb) => {
  const customId = `fermentador-${shortid.generate()}`;
  socket.on('connect',
    () => {
      emitClientInfo({ customId });
      cb(null, customId);
    }
  );
};

export const subscribeToMessages = (cb) => {
  socket.on('message', message => cb(null, message));
};

export const subscribeToBroadcast = (cb) => {
  socket.on('broadcast', data => cb(null, data));
};

export default {
  subscribeToConnect,
  subscribeToMessages,
  subscribeToBroadcast,
  emitMessage,
  emitClientInfo
};
