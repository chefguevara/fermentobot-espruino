const network = require('./network');
const config = require('./config');

const onInit = () =>  network.start(...config.loadAll());


