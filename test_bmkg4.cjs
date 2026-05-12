const http = require('https');
http.get('https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-DKIJakarta.xml', (res) => {
  console.log(res.statusCode);
  res.on('data', d => console.log(d.toString().substring(0, 100)));
});
