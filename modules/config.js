var flash = new (require("FlashEEPROM"))();

exports.config = {
  /*
   0. device name
   1. SSID
   2. Password
   3. Sensor
   4. Relay Cooler
   5. Relay Heater
   */
  load: (index) => E.toString(flash.read(index) || ''),
  save: (index, value) => flash.write(index, value),
  loadAll: () => {
    const arr = [0, 0, 0, 0, 0, 0]; //is this less ugly than new Array(6)
    return arr.map((i, k) => config.load(k));
  }
};