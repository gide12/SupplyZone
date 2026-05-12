fetch('https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-JawaBarat.xml')
  .then(res => {
     console.log(res.status, res.headers.get('access-control-allow-origin'));
     return res.text();
  })
  .then(text => console.log(text.substring(0, 100)))
  .catch(err => console.error(err));
