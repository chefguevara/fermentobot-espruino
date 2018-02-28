const network = require('network');
const WebSocket = require('ws');

const host = '192.168.100.104';

const ws = new WebSocket(host, {
  path: '/',
  port: 8080, // default is 80
  origin: 'Espruino',
  keepAlive: 60
});

const pinSensor = 4;
const pinRelay = '';

var ow = new OneWire(pinSensor);
var sensor = require("DS18B20").connect(ow);

const ow = new OneWire(pinSensor);
const sensor = require("DS18B20").connect(ow);

const defaultConfig = {
  hostname: 'fermentobot',
  ssid: 'M1tr32900',
  password: 'P4p4l3t4',
  sensor: 4,
  cooler: 0
};

network.start(defaultConfig).then(() => {
  console.log('start!');

  ws.on('open', () => {
    console.log('Connected to server');

    setInterval(
      () => {
        const temp = sensor.getTemp();
        console.log('temp: ', temp);
        ws.send({ temp: temp });
        if (temp >= maxTemp - 1) {
          console.log('temp alta!', temp);
          ws.send({ message: 'high' });
        }
        if (temp < minTemp + 1) {
          console.log('temp baja!', temp);
          ws.send({ message: 'low' });
        }
      },
      1000
    );
  });
});
