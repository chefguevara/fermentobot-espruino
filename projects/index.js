const wifi = require('Wifi');
const http = require('http');

const HTTP_PORT = 80;
const AP_SSID = 'fermentobot';
const AP_PASSWD = 'fermentobot';

/*
===================== Screen control ====================
*/
const scl = NodeMCU.D1;
const sda = NodeMCU.D2;

I2C1.setup({
  scl: scl,
  sda: sda
});

const g = require('SSD1306').connect(I2C1, () => {
  headLine('fermentobot');
  bodyText('Initializing', 20, 0, 30);
  print();
});

function reset() {
  g.clear();
  g.flip();
}

function print() {
  g.flip();
}

function headLine(str) {
  g.setFontVector(15);
  g.drawString(str, 0, 0);
}

function bodyText(str, size, x, y) {
  g.setFontVector(size);
  g.drawString(str, x, y);
}

const screen = {
  g: g,
  headLine: headLine,
  bodyText: bodyText,
  reset: reset,
  print: print
};

/*
===================== WiFi control ====================
*/

const connectToWifi = (ssid, password, callback) => {
  wifi.connect(ssid, {
    password: password
  }, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    callback();
    console.log(wifi.getDetails());
  });
};

const getConfigurationPage = (res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.write(`
    <html>
        <head>
            <meta name="viewport" content="initial-scale=1.0" />
            <meta charset="utf-8" />
            <title>Fermentobot</title>
        </head>
        <body>
          <div class="container-fluid">
            <h1>Welcome to Fermentobot!</h1>
            <h2>Configuration</h2>
            <form action="/" method="post">
              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">Hostname</span>
                <input type="text" name="hostname" id="hostname" value="" />
              </div>
              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">SSID</span>
                <input type="text" name="ssid" id="ssid" value="" />
              </div>

              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">Password</span>
                <input type="text" name="password" id="password" value="" />
              </div>
              <button type="submit" class="btn btn-success dropdown-toggle">Save</button>
            </form>
          </div>
        </body>
    </html>
    `);
  res.end();
};

// build http server
const onRequest = function onRequest(req, res){
  if (req.url !== '/') {
    res.writeHead(404, {
      'Content-Type': 'text/html'
    });
    res.end();
    return;
  }

  if (req.method === 'POST') {
    console.log('POST data');
    saveConfiguration(req, res, readOnlyConf, resolve);
    // TODO: show a response page with success
  } else if (req.method === 'GET') {
    console.log('Get Data');
    getConfigurationPage(res);
  }
};

const startAP = (resolve) => {
   wifi.startAP(AP_SSID, {
    authMode: 'wpa_wpa2',
    password: AP_PASSWD
  }, (err) => {
    if (err) {
      console.log('wifi.startAP:', err);
      return;
    }
    console.log(wifi.getAPDetails());
    setTimeout(() => {
      screen.reset();
      screen.headLine('AP Mode');
      screen.bodyText(`SSID: ${AP_SSID}`, 12, 0, 20);
      screen.bodyText(`PASS: ${AP_PASSWD}`, 12, 0, 40);
      screen.print();
    }, 1000);
  });
  http.createServer(onRequest).listen(HTTP_PORT);
  console.log(`Listen http://${wifi.getAPIP().ip}:${HTTP_PORT}`);
};

const saveConfiguration = (req, res, resolve) => {
  const buf = [];

  req.on('data', chunk => buf.push(chunk));

  req.on('end', () => {
    const config = buf.join('').split('&').map(v => v.split('='))
      .reduce((a, c) => Object.defineProperty(a, c[0], { value: c[1] }), {});
    // do something between roconfig and config
    const ssid = config.ssid;
    const password = decodeURIComponent(config.password);
    const hostname = config.hostname;

    console.log(config);

    wifi.setHostname(hostname);
    wifi.stopAP(() => {
      connectToWifi(
        ssid,
        password,
        () => {
          resolve(config);
        }
      );
    });
    console.log('will connect in 3...2...1...');
  });

  res.writeHead(302, {
    Location: '/'
  });
  res.end();
};

function connect(savedConfig) {
  return new Promise((resolve) => {
    wifi.on('connected', data => console.log('connected', data));
    wifi.on('disconnected', data => console.log('disconnected', data));
    wifi.on('dhcp_timeout', () => console.log('dhcp_timeout'));
    wifi.on('auth_change', data => console.log('auth_change', data));
    wifi.on('associated', data => console.log('associated', data));
    if (savedConfig) {
      wifi.setHostname(savedConfig.hostname);
      console.log('wifi connect');
      connectToWifi(savedConfig.ssid, savedConfig.password, resolve);
    } else {
      console.log('wifi AP');
      startAP(resolve);
    }

  });
}

connect().then(() => {
  console.log('start!');
});
