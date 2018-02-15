var network = require('network');

var pinSensor = 4;
var pinRelay = 5;

var ow = new OneWire(pinSensor);
var sensor = require("DS18B20").connect(ow);

var maxTemp = 30.5;
var minTemp = 24.5;

var defaultConfig = {
  hostname: 'fermentobot',
  ssid: 'M1tr32900',
  password: 'P4p4l3t4',
  sensor: pinSensor,
  cooler: pinRelay
};

network.start(defaultConfig).then(() => {
  console.log('start!');
});

function setCooler(isOn) {
  digitalWrite(pinRelay, !isOn); // 0 turns the relay on, 1 turns it off
}

setInterval(
  function() {
    var temp = sensor.getTemp();
    console.log('temp: ', temp);
    console.log('maxTemp: ', maxTemp);
    console.log('minTemp: ', minTemp);
    if (temp >= maxTemp - 1) { setCooler(true); console.log('temp alta!'); }
    if (temp < minTemp + 1) { setCooler(false); console.log('temp baja!'); }
  },
  2000
);
