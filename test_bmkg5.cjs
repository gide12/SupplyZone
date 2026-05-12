const http = require('https');
http.get('https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-DKIJakarta.xml', (res) => {
  console.log(res.headers.location);
});
