const wifi = require('Wifi');
const config = require('config');
const http = require('http');

const HTTP_PORT = 8080;
const AP_SSID = 'fermentobot';
const AP_PASSWD = 'fermentobot';

const fieldMap = ['deviceName', 'ssid', 'password', 'sensor', 'cooler', 'heater'];

const getConfiguration = (res, deviceName, ssid, password, sensor, cooler, heater) => {
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
}

const start = (deviceName, ssid, password, sensor, cooler, heater) => {
  // add debug eventlisteners
  //wifi.on('probe_recv',   data => console.log('probe_recv', data));
  wifi.on('connected', data => console.log('connected', data));
  wifi.on('disconnected', data => console.log('disconnected', data));
  wifi.on('dhcp_timeout', () => console.log('dhcp_timeout'));
  wifi.on('auth_change', data => console.log('auth_change', data));
  wifi.on('associated', data => console.log('associated', data));

  if (ssid && password) {
    wifi.connect(ssid, {
      password
    }, (err, data) => {
      if (err) {
        console.log('wifi.connect:', err);
        return;
      }
      console.log(wifi.getIP(), wifi.getDetails());
      // do something after 
    });
  } else {
    // activate ap
    wifi.startAP(AP_SSID, {
      authoMode: 'wpa_wpa2',
      password: AP_PASSWD
    }, err => {
      if (err) {
        console.log('wifi.startAP:', err);
        return;
      }
      let apinfo = wifi.getAPDetails();
      console.log(apinfo);

      // build http server
      let onRequest = (req, res) => {
        if (req.url !== '/') {
          res.writeHead(404, {
            'Content-Type': 'text/html'
          });
          res.end();
          return;
        }

        // led on/off command
        if (req.method === 'POST') {
          let buf = [];
          req.on('data', chunk => buf.push(chunk));
          req.on('end', () => {
            let query = buf.join('').split('&').map(v => v.split('=').map(t => encodeURIComponent(t)))
              .reduce((a, c) => Object.defineProperty(a, c[0], {
                value: c[1]
              }), {});
              Object.keys(query).forEach(key => {
                if (fieldMap.contains(key)) {
                  console.log(`saving ${key}: ${query[key]}`);
                  config.save(fieldMap.indexOf(key), query[key]);
                }
              });
          });
          // TODO: show a response page with success
          res.writeHead(302, {
            Location: '/'
          });
          res.end();
          return;
        } else if (req.method === 'GET') {
          console.log('GET witg params:', deviceName, ssid, password, sensor, cooler, heater);
          getConfiguration(res, deviceName, ssid, password, sensor, cooler, heater);
        }

        // response page
      };

      http.createServer(onRequest).listen(HTTP_PORT);
      console.log('Listen http://', wifi.getAPIP().ip + ':' + HTTP_PORT);
    });
  }
};

exports.network = {start};