fetch('https://ibnux.github.io/BMKG-importer/cuaca/501233.json')
  .then(res => res.json())
  .then(data => {console.log(data); process.exit(0);})
  .catch(err => {console.error(err); process.exit(1);});
