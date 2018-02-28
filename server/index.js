const express = require('express');
const path = require('path');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const externalip = require('externalip');

// Tell express to use the resources from 'build' folder
app.use(express.static(path.join(__dirname, 'build')));

console.log('path: ', __dirname);

// Answer '/ping' url with a 'pong' string on the browser
app.get('/ping', (req, res) => res.send('pong'));

// Serve the create-react-app app (ui) from the build folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Variables
const PORT = 8080;

// app.get('/', (req, res) => res.sendFile(`${__dirname}/public/index.html`));

const clients = [];

// Remove the client from the 'clients' array
const removeClient = (query) => {
  for (let i = 0, len = clients.length; i < len; ++i) {
    const c = clients[i];

    if (c.clientId === query) {
      clients.splice(i, 1);
      break;
    }
  }
};

// Get the 'customId' by passing the 'socket.client.id'
const getClientCustomId = (query) => {
  const found = clients.find(element => element.clientId === query);
  return found.customId;
};

// Print the 'customId' from all connected clients
const printClientsCustomId = () => {
  clients.forEach((client) => {
    console.log(`connected client: ${client.customId}`);
  });
};

// Get the public ip of the server
externalip((err, ip) => {
  console.log(`External ip: ${ip}`);
});

io.on('connection', (socket) => { // Al conectar...
  // Sumamos el cliente conectado a la variable global de clientes conectados
  socket.on('storeClientInfo', (data) => { // Al conenctarse un cliente...
    const clientInfo = {};
    clientInfo.customId = data.customId;
    clientInfo.clientId = socket.client.id;
    clientInfo.sensor = 24.15;
    clientInfo.relay = false;
    clients.push(clientInfo);

    // Clear the console
    console.clear();
    // Imprime el 'id' del cliente al conectar
    printClientsCustomId();

    // Emite un mensaje a todos los clientes conectados mostrando numero de clientes conectados
    io.sockets.emit('broadcast', clients);
    console.log('clientes conectados: ', clients.length);
  });

  socket.on('message', (data) => { // Al emitir un mensaje...
    io.sockets.emit('message', { description: { client: getClientCustomId(socket.client.id), temp: data } });
    console.log(`Message from ${getClientCustomId(socket.client.id)}: `, data);
  });

  socket.on('disconnect', () => { // Al desconectar...
    console.clear();
    // Restamos el cliente desconectado a la variable global de clientes conectados
    removeClient(socket.client.id);
    // Vuelve a emitir un mensaje con el numero de clientes conectados
    io.sockets.emit('broadcast', clients.length);
    printClientsCustomId();
    console.log('clientes conectados: ', clients.length);
  });

  socket.on('error', (error) => { // Si hay algun error...
    // Emitimos el error al cliente
    io.sockets.emit('error', { description: 'ops, something failed' });
    // Mostramos el error en la consola del servidor
    console.log('error', error);
  });
});

server.listen(PORT, () => (console.log(`Escuchando en localhost:${PORT}`)));
