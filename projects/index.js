const network = require('network');
const Class = require('es-class'); // https://github.com/WebReflection/es-class

// const ow = new OneWire(A1);
// const sensor = require("DS18B20").connect(ow);

const maxTemp = 30.5;
const minTemp = 15.5;

network.start(network).then(() => {
  console.log('start!');
});

setInterval(
  () => {
    const temp = Math.floor(Math.random() * (maxTemp - minTemp)) + minTemp;
    console.log('temp: ', temp);
  },
  1000
);
