const network = require('network');
const config = require('config');

network.start(config).then(() => {
  console.log('start!');
});

