const fs = require('fs');
const path = require('path');

let p = path.join(process.cwd(), 'src/components/WeatherForecastModal.tsx');
let content = fs.readFileSync(p, 'utf8');

// replace location state
content = content.replace(
  /const \[location, setLocation\] = useState\("South Sulawesi"\);/,
  'const [location, setLocation] = useState("Jawa Barat");'
);

const provinces = `
                  <option value="Aceh">Aceh</option>
                  <option value="Sumatera Utara">Sumatera Utara</option>
                  <option value="Sumatera Barat">Sumatera Barat</option>
                  <option value="Riau">Riau</option>
                  <option value="Kepulauan Riau">Kepulauan Riau</option>
                  <option value="Jambi">Jambi</option>
                  <option value="Bengkulu">Bengkulu</option>
                  <option value="Sumatera Selatan">Sumatera Selatan</option>
                  <option value="Kepulauan Bangka Belitung">Kep. Bangka Belitung</option>
                  <option value="Lampung">Lampung</option>
                  <option value="Banten">Banten</option>
                  <option value="Jawa Barat">Jawa Barat</option>
                  <option value="DKI Jakarta">DKI Jakarta</option>
                  <option value="Jawa Tengah">Jawa Tengah</option>
                  <option value="DI Yogyakarta">DI Yogyakarta</option>
                  <option value="Jawa Timur">Jawa Timur</option>
                  <option value="Bali">Bali</option>
                  <option value="Nusa Tenggara Barat">Nusa Tenggara Barat</option>
                  <option value="Nusa Tenggara Timur">Nusa Tenggara Timur</option>
                  <option value="Kalimantan Barat">Kalimantan Barat</option>
                  <option value="Kalimantan Tengah">Kalimantan Tengah</option>
                  <option value="Kalimantan Selatan">Kalimantan Selatan</option>
                  <option value="Kalimantan Timur">Kalimantan Timur</option>
                  <option value="Kalimantan Utara">Kalimantan Utara</option>
                  <option value="Sulawesi Utara">Sulawesi Utara</option>
                  <option value="Gorontalo">Gorontalo</option>
                  <option value="Sulawesi Tengah">Sulawesi Tengah</option>
                  <option value="Sulawesi Barat">Sulawesi Barat</option>
                  <option value="Sulawesi Selatan">Sulawesi Selatan</option>
                  <option value="Sulawesi Tenggara">Sulawesi Tenggara</option>
                  <option value="Maluku">Maluku</option>
                  <option value="Maluku Utara">Maluku Utara</option>
                  <option value="Papua Barat">Papua Barat</option>
                  <option value="Papua">Papua</option>
`;

const replaceTarget = `<input 
                  type="text" 
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-lg font-bold text-gray-900 focus:outline-none focus:border-blue-500 game-text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. South Sulawesi"
                />`;

const replaceWith = `<select 
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-lg font-bold text-gray-900 focus:outline-none focus:border-blue-500 game-text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
${provinces}
                </select>`;

content = content.replace(replaceTarget, replaceWith);

const headerReplaceTarget = `<h2 className="text-2xl font-bold text-gray-900 game-title text-blue-900">Cek Harga & Forecast</h2>`;
const headerReplaceWith = `<h2 className="text-2xl font-bold text-gray-900 game-title text-blue-900">Prakiraan Cuaca & Harga (BMKG & AI)</h2>`;
content = content.replace(headerReplaceTarget, headerReplaceWith);

const buttonsTarget = `<button 
                 onClick={handlePredict}
                 disabled={loading}
                 className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white font-bold transition-all flex items-center gap-2 game-text text-lg"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (weatherCondition.includes('Rain') ? <CloudRain className="w-5 h-5" /> : <Sun className="w-5 h-5" />)}
                 {loading ? "Analyzing Nature..." : "Analyze Weather Impact"}
               </button>`;

const buttonsReplaceWith = `<div className="flex gap-2">
                 <a 
                   href="https://www.bmkg.go.id/cuaca/prakiraan-cuaca-indonesia.bmkg"
                   target="_blank"
                   rel="noreferrer"
                   className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all flex items-center gap-2 game-text text-md rounded"
                 >
                   Direct Link BMKG
                 </a>
                 <button 
                   onClick={handlePredict}
                   disabled={loading}
                   className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white font-bold transition-all flex items-center gap-2 game-text text-lg rounded"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (weatherCondition.includes('Rain') ? <CloudRain className="w-5 h-5" /> : <Sun className="w-5 h-5" />)}
                   {loading ? "Menganalisis..." : "Forecasting Supply AI"}
                 </button>
               </div>`;

content = content.replace(buttonsTarget, buttonsReplaceWith);

fs.writeFileSync(p, content);
console.log('updated weather modal');
