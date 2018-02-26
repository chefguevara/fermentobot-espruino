const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const externalip = require('externalip');
const moment = require('moment');

const PORT = 8080;

// app.get('/', (req, res) => res.sendFile(`${__dirname}/public/index.html`));

const clients = [];

// Remove the client from the 'clients' array.
const removeClient = (query) => {
  for (let i = 0, len = clients.length; i < len; ++i) {
    const c = clients[i];

    if (c.clientId === query) {
      clients.splice(i, 1);
      break;
    }
  }
};

// Get the 'customId' by passing the 'socket.client.id'.
const getClientCustomId = (query) => {
  const found = clients.find(element => element.clientId === query);
  return found.customId;
};

// Get the public ip of the server.
externalip((err, ip) => {
  console.log(`External ip: ${ip}`);
});

io.on('connection', (socket) => { // Al conectar...
  // Sumamos el cliente conectado a la variable global de clientes conectados.
  socket.on('storeClientInfo', (data) => {
    const clientInfo = {};
    clientInfo.customId = data.customId;
    clientInfo.clientId = socket.client.id;
    clients.push(clientInfo);

    // Imprime el 'id' del cliente al conectar.
    console.log('connected clientId: ', getClientCustomId(socket.client.id));

    // Emite un mensaje a todos los clientes conectados mostrando numero de clientes conectados
    io.sockets.emit('broadcast', clients.length);
    console.log('clientes conectados: ', clients.length);
  });

  socket.on('message', (data) => {
    io.sockets.emit('message', { description: `from: ${socket.client.id} - ${data}` });
    console.log(`Message from ${socket.client.id}: `, data);
  });

  socket.on('disconnect', () => { // Al desconectar...
    // Restamos el cliente desconectado a la variable global de clientes conectados.
    removeClient(socket.client.id);
    // Vuelve a emitir un mensaje con el numero de clientes conectados.
    io.sockets.emit('broadcast', clients.length);
    console.log('clientes conectados: ', clients.length);
  });

  socket.on('error', (error) => { // Si hay algun error...
    // Emitimos el error al cliente.
    io.sockets.emit('error', { description: 'ops, something failed' });
    // Mostramos el error en la consola del servidor.
    console.log('error', error);
  });
});

server.listen(PORT, () => (console.log(`Escuchando en localhost:${PORT}`)));
