fetch('https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-DKIJakarta.xml')
  .then(res => res.text())
  .then(text => console.log(text.substring(0, 500)))
  .catch(err => console.error(err));
