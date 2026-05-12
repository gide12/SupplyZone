fetch('https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-Jawabarat.xml')
  .then(res => res.text())
  .then(text => console.log(text.substring(0, 200)))
  .catch(err => console.error(err));
