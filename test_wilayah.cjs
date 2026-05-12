fetch('https://ibnux.github.io/BMKG-importer/cuaca/wilayah.json')
  .then(res => res.json())
  .then(data => console.log(data.slice(0, 5)))
  .catch(err => console.error(err));
