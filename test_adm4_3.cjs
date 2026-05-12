fetch('https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=33.74.01.1001')
  .then(res => res.json())
  .then(data => {console.log(data?.lokasi?.provinsi, data?.lokasi?.kotkab); process.exit(0);})
  .catch(err => {console.error(err); process.exit(1);});
