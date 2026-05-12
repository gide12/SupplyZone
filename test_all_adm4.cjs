const codes = {
  "Aceh": "11.71.01.2001", 
  "Sumatera Utara": "12.71.01.1001",
  "Sumatera Barat": "13.71.01.1001",
  "Riau": "14.71.01.1001",
  "Kepulauan Riau": "21.71.01.1001",
  "Jambi": "15.71.01.1001",
  "Bengkulu": "17.71.01.1001",
  "Sumatera Selatan": "16.71.01.1001",
  "Kepulauan Bangka Belitung": "19.71.01.1001",
  "Lampung": "18.71.01.1001",
  "Banten": "36.71.01.1001",
  "Jawa Barat": "32.73.01.1001",
  "DKI Jakarta": "31.71.03.1001",
  "Jawa Tengah": "33.74.01.1001",
  "DI Yogyakarta": "34.71.01.1001",
  "Jawa Timur": "35.78.01.1001",
  "Bali": "51.71.01.1001",
  "Nusa Tenggara Barat": "52.71.01.1001",
  "Nusa Tenggara Timur": "53.71.01.1001",
  "Kalimantan Barat": "61.71.01.1001",
  "Kalimantan Tengah": "62.71.01.1001",
  "Kalimantan Selatan": "63.71.01.1001",
  "Kalimantan Timur": "64.71.01.1001",
  "Kalimantan Utara": "65.71.01.1001",
  "Sulawesi Utara": "71.71.01.1001",
  "Gorontalo": "75.71.01.1001",
  "Sulawesi Tengah": "72.71.01.1001",
  "Sulawesi Barat": "76.01.01.1001",
  "Sulawesi Selatan": "73.71.01.1001",
  "Sulawesi Tenggara": "74.71.01.1001",
  "Maluku": "81.71.01.1001",
  "Maluku Utara": "82.71.01.1001",
  "Papua Barat": "92.71.01.1001",
  "Papua": "91.71.01.1001"
};

async function testAll() {
  for (const [prov, code] of Object.entries(codes)) {
    try {
      const res = await fetch('https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=' + code);
      if (res.ok) {
        const d = await res.json();
        console.log("OK:", prov, d?.lokasi?.kotkab);
      } else {
        console.log("FAIL:", prov, code, res.status);
      }
    } catch(e) {
      console.log("ERROR:", prov, code);
    }
  }
}
testAll();
