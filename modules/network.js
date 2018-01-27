const wifi = require('Wifi');
const http = require('http');

const HTTP_PORT = 8080;
const AP_SSID = 'fermentobot';
const AP_PASSWD = 'fermentobot';

const getConfigurationPage = (res, deviceName, ssid, password, sensor, cooler, heater) => {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.write(`
    <html>
        <head>
            <meta name="viewport" content="initial-scale=1.0" />
            <meta charset="utf-8" />
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
            <title>Fermentobot</title>
        </head>
        <body>
          <div class="container-fluid">
            <h1>Welcome to ${deviceName || 'Fermentobot'}!</h1>
            
            <h2>Confifguration</h2>
            <form action="/" method="post">
              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">Device Name</span>
                <input type="text" name="deviceName" id="deviceName" value="${deviceName || ''}" />
              </div>
              
              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">SSID</span>
                <input type="text" name="ssid" id="ssid" value="${ssid || ''}" />
              </div>

              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">Password</span>
                <input type="text" name="password" id="password" value="${password || ''}" />
              </div>

              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">Sensor Pin</span>
                <input type="text" name="sensor" id="sensor" value="${sensor || ''}" />
              </div>
                
              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">Cooler Relay Pin</span>
                <input type="text" name="cooler" id="cooler" value="${cooler || ''}" />
              </div>

              <div class="input-group">
                <span class="input-group-addon" id="basic-addon1">Heater Relay Pin</span>
                <input type="text" name="heater" id="heater" value="${heater || ''}" />
              </div>
              <button type="submit" class="btn btn-success dropdown-toggle">Save</button>
            </form>
          </div>
          <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
        </body>
    </html>
    `);
  res.end();
};

const saveConfiguration = (req, res, config) => {
  const fieldMap = ['deviceName', 'ssid', 'password', 'sensor', 'cooler', 'heater'];
  const buf = [];
  req.on('data', chunk => buf.push(chunk));
  req.on('end', () => {
    const query = buf.join('').split('&').map(v => v.split('=').map(t => encodeURIComponent(t)))
      .reduce((a, c) => Object.defineProperty(a, c[0], { value: c[1] }), {});
    Object.keys(query).forEach((key) => {
      const index = fieldMap.indexOf(key);
      if (index >= 0) {
        console.log(`saving ${key}: ${query[key]}`);
        config.save(index, query[key]);
      }
    });
    setTimeout(() => {
      console.log('will reset in 3...2...1...');
      reset();
    }, 5000);
  });
  res.writeHead(302, {
    Location: '/'
  });
  res.end();
};

exports = {
  start: config => new Promise((resolve, reject) => {
    const configData = config.loadAll();
    const deviceName = configData[0];
    const ssid = configData[1];
    const password = configData[2];
    const sensor = configData[3];
    const cooler = configData[4];
    const heater = configData[5];

    wifi.on('connected', data => console.log('connected', data));
    wifi.on('disconnected', data => console.log('disconnected', data));
    wifi.on('dhcp_timeout', () => console.log('dhcp_timeout'));
    wifi.on('auth_change', data => console.log('auth_change', data));
    wifi.on('associated', data => console.log('associated', data));

    if (ssid && password) {
      wifi.connect(ssid, {
        password
      }, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ ip: wifi.getIP(), details: wifi.getDetails() });
      });
    } else {
      // activate ap
      wifi.startAP(AP_SSID, {
        authoMode: 'wpa_wpa2',
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
            saveConfiguration(req, res, config);
            // TODO: show a response page with success
          } else if (req.method === 'GET') {
            console.log('GET with params:', deviceName, ssid, password, sensor, cooler, heater);
            getConfigurationPage(res, deviceName, ssid, password, sensor, cooler, heater);
          }
        };

        http.createServer(onRequest).listen(HTTP_PORT);
        console.log(`Listen http://${wifi.getAPIP().ip}:${HTTP_PORT}`);
      });
    }
  })
};
