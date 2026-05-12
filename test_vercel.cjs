fetch('https://cuaca-gempa-rest-api.vercel.app/')
  .then(res => res.text())
  .then(text => {console.log(text.substring(0, 100)); process.exit(0);})
  .catch(err => {console.error(err); process.exit(1);});
