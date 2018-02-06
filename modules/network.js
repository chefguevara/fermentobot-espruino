const wifi = require('Wifi');
const http = require('http');

const HTTP_PORT = 80;
const AP_SSID = 'fermentobot';
const AP_PASSWD = 'fermentobot';

const getConfigurationPage = (res, readOnlyConf) => {
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
            <h1>Welcome to ${readOnlyConf.hostname || 'Fermentobot'}!</h1>
            
            <h2>Confifguration</h2>
            <form action="/" method="post">
              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">Hostname</span>
                <input type="text" name="hostname" id="hostname" value="${readOnlyConf.hostname || ''}" />
              </div>
              
              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">SSID</span>
                <input type="text" name="ssid" id="ssid" value="${readOnlyConf.ssid || ''}" />
              </div>

              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">Password</span>
                <input type="text" name="password" id="password" value="${readOnlyConf.password || ''}" />
              </div>

              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">Sensor Pin</span>
                <input type="text" name="sensor" id="sensor" value="${readOnlyConf.sensor || ''}" />
              </div>
                
              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">Cooler Relay Pin</span>
                <input type="text" name="cooler" id="cooler" value="${readOnlyConf.cooler || ''}" />
              </div>

              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">Valve Relay Pin</span>
                <input type="text" name="valve" id="valve" value="${readOnlyConf.valve || ''}" />
              </div>
              <button type="submit" class="btn btn-success dropdown-toggle">Save</button>
            </form>
          </div>
        </body>
    </html>
    `);
  res.end();
};

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

const saveConfiguration = (req, res, readOnlyConf, resolve) => {
  const buf = [];
  req.on('data', chunk => buf.push(chunk));
  req.on('end', () => {
    const config = buf.join('').split('&').map(v => v.split('='))
      .reduce((a, c) => Object.defineProperty(a, c[0], { value: c[1] }), {});
    // do something between roconfig and config
    const ssid = (readOnlyConf) ? config.ssid : readOnlyConf.ssid;
    const password = (readOnlyConf) ? decodeURIComponent(config.password) : readOnlyConf.password;
    const hostname = (readOnlyConf) ? config.hostname : readOnlyConf.hostname;
    console.log(config);
    wifi.setHostname(hostname);
    wifi.stopAP(() => {
      connectToWifi(
        ssid,
        password,
        () => {
          resolve({ sensor: config.sensor, cooler: config.cooler, valve: config.valve });
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

exports = {
  start: readOnlyConf => new Promise((resolve) => {
    wifi.on('connected', data => console.log('connected', data));
    wifi.on('disconnected', data => console.log('disconnected', data));
    wifi.on('dhcp_timeout', () => console.log('dhcp_timeout'));
    wifi.on('auth_change', data => console.log('auth_change', data));
    wifi.on('associated', data => console.log('associated', data));

    if (readOnlyConf.prod) { // ?
      wifi.setHostname(readOnlyConf.hostname);
      connectToWifi(
        readOnlyConf.ssid,
        readOnlyConf.password,
        () => {
          resolve({
            sensor: readOnlyConf.sensor,
            cooler: readOnlyConf.cooler,
            valve: readOnlyConf.valve
          });
        }
      );
    } else {
      // activate ap
      wifi.startAP(AP_SSID, {
        authMode: 'wpa_wpa2',
        password: AP_PASSWD
      }, (err) => {
        if (err) {
          console.log('wifi.startAP:', err);
          return;
        }
        console.log(wifi.getAPDetails());

        // build http server
        const onRequest = (req, res) => {
          if (req.url !== '/') {
            res.writeHead(404, {
              'Content-Type': 'text/html'
            });
            res.end();
            return;
          }

          if (req.method === 'POST') {
            saveConfiguration(req, res, readOnlyConf, resolve);
            // TODO: show a response page with success
          } else if (req.method === 'GET') {
            getConfigurationPage(res, readOnlyConf);
          }
        };

        http.createServer(onRequest).listen(HTTP_PORT);
        console.log(`Listen http://${wifi.getAPIP().ip}:${HTTP_PORT}`);
      });
    }
  })
};
