const fs = require('fs');
const path = require('path');

let p = path.join(process.cwd(), 'src/components/WeatherForecastModal.tsx');
let content = fs.readFileSync(p, 'utf8');

const codesMapping = `const adm4Codes: Record<string, string> = {
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
};`;

content = content.replace(
  /export function WeatherForecastModal\(\{/,
  codesMapping + '\n\nexport function WeatherForecastModal({'
);

content = content.replace(
  /const \[location, setLocation\] = useState\("Jawa Barat"\);/,
  `const [location, setLocation] = useState("Jawa Barat");
  const [bmkgData, setBmkgData] = useState<any>(null);
  const [loadingBmkg, setLoadingBmkg] = useState(false);`
);

const fetchBmkgLogic = `
  const handleFetchBMKG = async () => {
    setLoadingBmkg(true);
    setBmkgData(null);
    try {
      const code = adm4Codes[location] || "31.71.03.1001"; // Fallback to Jakarta if not mapped
      const res = await fetch(\`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=\${code}\`);
      if (res.ok) {
         const data = await res.json();
         const firstCuaca = data.data?.[0]?.cuaca?.[0]?.[0];
         if (firstCuaca) {
           setBmkgData({
              temp: firstCuaca.t || "-",
              weather: firstCuaca.weather_desc || "-",
              humidity: firstCuaca.hu || "-",
              kota: data.lokasi?.kotkab || location
           });
           // Automatically set AI weather condition based on BMKG if possible
           if (firstCuaca.weather_desc) {
             const w = firstCuaca.weather_desc.toLowerCase();
             if (w.includes('hujan')) setWeatherCondition("Heavy Rain / La Nina");
             else if (w.includes('cerah')) setWeatherCondition("Drought / El Nino");
             else setWeatherCondition("Seasonal Transition (Pancaroba)");
           }
         }
      } else {
         alert("BMKG API returned status " + res.status);
      }
    } catch(e) {
      console.error(e);
      alert("Gagal Fetch API BMKG.");
    } finally {
      setLoadingBmkg(false);
    }
  };
`;

content = content.replace(
  /const handlePredict = async \(\) => \{/,
  fetchBmkgLogic + '\n  const handlePredict = async () => {'
);


const aiPromptReplace = `Predict how the current forecasted weather (\${weatherCondition}) in \${location} will affect the harvest, supply, and future prices for these ingredients.`;
const newAiPromptReplace = `Predict how the current forecasted weather (\${bmkgData?.weather || weatherCondition}) in \${location} will affect the harvest, supply, and future prices for these ingredients.`;
content = content.replace(aiPromptReplace, newAiPromptReplace);

const replaceTarget = `<a 
                   href="https://www.bmkg.go.id/cuaca/prakiraan-cuaca-indonesia.bmkg"
                   target="_blank"
                   rel="noreferrer"
                   className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all flex items-center gap-2 game-text text-md rounded"
                 >
                   Direct Link BMKG
                 </a>`;

const replacement = `<button 
                   onClick={handleFetchBMKG}
                   disabled={loadingBmkg}
                   className="px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-gray-300 text-white font-bold transition-all flex items-center gap-2 game-text text-md rounded"
                 >
                   {loadingBmkg ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudRain className="w-4 h-4" />}
                   {loadingBmkg ? "Loading..." : "Tarik Data BMKG"}
                 </button>`;

content = content.replace(replaceTarget, replacement);

const bmkgDisplayTarget = `<div className="mt-4 flex items-center justify-between">`;
const bmkgDisplayReplace = `
            {bmkgData && (
              <div className="bg-teal-50 p-4 border border-teal-200 mt-4 rounded-xl flex items-center gap-4 animate-in fade-in zoom-in">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center border border-teal-300">
                  <CloudRain className="text-teal-600 w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-teal-800 game-text uppercase tracking-wider">{bmkgData.kota}</h4>
                  <div className="text-2xl font-bold text-teal-900 game-text">{bmkgData.weather}</div>
                  <div className="text-xs text-teal-700 font-bold game-text">Suhu: {bmkgData.temp}°C | Kelembaban: {bmkgData.humidity}%</div>
                </div>
              </div>
            )}
            <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">`;

content = content.replace(bmkgDisplayTarget, bmkgDisplayReplace);

// We need to close the div added in gap-4 because old was <div className="...">
// Oh actually we just replaced the opening tag `<div className="mt-4 flex items-center justify-between">`
// Wait, the old tag was `            <div className="mt-4 flex items-center justify-between">`.
// So we just replaced it with `<div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">`. That's safe!

fs.writeFileSync(p, content);
console.log('updated fetching bmkg real data');
