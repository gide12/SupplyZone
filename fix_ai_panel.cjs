const fs = require('fs');
const path = require('path');

function styleAIPanel(content) {
  // Update the title block and background
  content = content.replace(
    /className="bg-\[\#EE2737\]\/10 border border-\[\#EE2737\] p-5 h-full relative"/g,
    'className="bg-white border border-gray-200 p-6 h-full relative shadow-sm"'
  );
  content = content.replace(
    /className="bg-\[\#EE2737\]\/10 border border-\[\#EE2737\] p-5 relative"/g,
    'className="bg-white border border-gray-200 p-6 relative shadow-sm"'
  );

  // Text colors
  content = content.replace(
    /className="font-bold text-\[\#EE2737\] text-xl game-title   flex items-center gap-2 mb-4"/g,
    'className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 text-xl game-title flex items-center gap-2 mb-4"'
  );

  // BrainCircuit icon
  content = content.replace(
    /<BrainCircuit className="w-6 h-6" \/> AI/g,
    '<BrainCircuit className="w-6 h-6 text-purple-600" /> <span className="text-gray-900">AI</span>'
  );

  // Button 1: Hitung Kapasitas
  content = content.replace(
    /className="w-full py-3 bg-\[\#EE2737\] hover:bg-\[\#EE2737\]\/80 disabled:bg-gray-800 disabled:text-white text-gray-900 font-bold  game-text text-lg flex items-center justify-center gap-2 transition-colors border border-\[\#EE2737\] mb-6"/g,
    'className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:bg-gray-200 disabled:text-gray-400 disabled:from-gray-200 disabled:to-gray-200 disabled:border-gray-200 disabled:shadow-none text-white font-bold game-text text-lg flex items-center justify-center gap-2 transition-all shadow-sm mb-3"'
  );

  // Replace text
  content = content.replace(/Calculate Efficiency & Capacity/g, 'Hitung Kapasitas');

  // Button 2: Cek Harga
  content = content.replace(
    /className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white font-bold game-text text-lg flex items-center justify-center gap-2 transition-colors border border-blue-600 mb-6"/g,
    'className="w-full py-3 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-blue-600 font-bold game-text text-lg flex items-center justify-center gap-2 transition-all border border-blue-600 shadow-sm mb-6"'
  );

  content = content.replace(/Cek Harga & Forecast/g, 'Cek Harga');

  if (!content.includes('setIsWeatherModalOpen(true)')) {
    const weatherButton = `
            <button 
              onClick={() => setIsWeatherModalOpen(true)}
              disabled={inventory.length === 0}
              className="w-full py-3 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-blue-600 font-bold game-text text-lg flex items-center justify-center gap-2 transition-all border border-blue-600 shadow-sm mb-6"
            >
              <CloudRain className="w-5 h-5" />
              Cek Harga
            </button>
    `;
    content = content.replace(
      /\{loading \? "Analyzing Matrix..." : "Hitung Kapasitas"\}\n\s*<\/button>/g,
      '{loading ? "Analyzing Matrix..." : "Hitung Kapasitas"}\n              </button>\n' + weatherButton
    );
  }

  // Restyle results to look less like an error
  content = content.replace(
    /className="bg-\[\#EE2737\]\/10 p-4 border border-\[\#EE2737\] mb-4"/g,
    'className="bg-purple-50 p-4 border border-purple-100 mb-4 rounded-sm"'
  );
  content = content.replace(
    /className="text-sm font-bold text-\[\#EE2737\]  game-text uppercase mb-2"/g,
    'className="text-sm font-bold text-purple-700 game-text uppercase mb-2"'
  );

  return content;
}

const resPath = path.join(process.cwd(), 'src/components/RestaurantInventory.tsx');
let resContent = fs.readFileSync(resPath, 'utf8');
fs.writeFileSync(resPath, styleAIPanel(resContent));

const supPath = path.join(process.cwd(), 'src/components/SupplierInventory.tsx');
let supContent = fs.readFileSync(supPath, 'utf8');
fs.writeFileSync(supPath, styleAIPanel(supContent));
console.log("Fixed panels");
