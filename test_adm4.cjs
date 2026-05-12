fetch('https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=31.71.03.1001')
  .then(res => res.json())
  .then(data => {console.log(data); process.exit(0);})
  .catch(err => {console.error(err); process.exit(1);});
