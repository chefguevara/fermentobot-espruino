var network=require('network');

var pinSensor='D3';
var pinRelay='';

var maxTemp=30.5;
var minTemp=24.5;

var defaultConfig={hostname:'fermentobot', ssid:'M1tr32900', password:'P4p4l3t4', sensor:pinSensor, cooler:pinRelay };

var ow=new OneWire(pinSensor);
var sensor=require('DS18B20').connect(ow);

function setCooler(isOn) {
  console.log('boom!', !isOn); // 0 turns the relay on, 1 turns it off
}

E.on('init', function(){
  network.start(defaultConfig).then(() => {
  console.log('start!');
  });
  setInterval(
  function() {
    var temp = sensor.getTemp();
    console.log('temp: ', temp);
    if (temp >= maxTemp - 1) { setCooler(true); console.log('temp alta!'); }
    if (temp < minTemp + 1) { setCooler(false); console.log('temp baja!'); }
  },
  2000
);
});