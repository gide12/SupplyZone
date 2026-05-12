fetch('https://ibnux.github.io/BMKG-importer/cuaca/501397.json')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
