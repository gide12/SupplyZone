const fs = require('fs');

const path = 'src/components/SupplierInventory.tsx';
let content = fs.readFileSync(path, 'utf8');

// Match everything up to the auto-import buttons end
const part1EndMarker = `<span className="text-[10px]">Unggah CSV/Excel</span>
              </button>
            </div>
          </div>
        </div>`;
const part1Index = content.indexOf(part1EndMarker);
if(part1Index === -1) throw new Error("part1 marker not found");

const part1End = part1Index + part1EndMarker.length;
let head = content.substring(0, part1End);

// Fix head: replace the extra "</div>" at the end with nothing, so we stay inside the left column
head = head.replace(/         <\/div>\n$/, ""); // simple regex to remove the last closing div of the left column

const stokIndex = content.indexOf('<div className="space-y-3">\n            <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-1">\n              <h3 className="text-sm font-bold text-[#00AA13]  tracking-wide game-text">Stok Saat Ini</h3>');
if(stokIndex === -1) throw new Error("stok marker not found");

const strayIndex = content.indexOf('        <div className="flex flex-col gap-6">\n          <div className="bg-white border border-gray-200 p-6 relative shadow-sm">\n            <h3 className="font-bold text-[#EE2737] text-xl game-title flex items-center gap-2 mb-2">\n               <BrainCircuit className="w-5 h-5" /> Smart AI Storage Warning\n      <EstimateExpirationModal ');
if(strayIndex === -1) throw new Error("stray marker not found");

const aiStartMarker = `<div className="flex flex-col gap-6">\n          <div className="bg-white border border-gray-200 p-6 relative shadow-sm">\n            <h3 className="font-bold text-[#EE2737] text-xl game-title flex items-center gap-2 mb-2">\n               <BrainCircuit className="w-5 h-5" /> Smart AI Storage Warning`;
const aiStartIndex = content.indexOf(aiStartMarker);
if(aiStartIndex === -1) throw new Error("ai start marker not found");

const aiBlock = content.substring(content.indexOf('<div className="bg-white border border-gray-200 p-6 relative shadow-sm">', aiStartIndex), content.indexOf('</div>\n          </div>', stokIndex - 50) + 12);
const stokBlock = content.substring(stokIndex, content.indexOf('        </div>\n        \n        <div className="flex flex-col gap-6">', strayIndex - 100));

const tailIndex = content.indexOf('<EstimateExpirationModal');
const tail = content.substring(tailIndex);

const newContent = `${head}

          ${stokBlock.trim()}
        </div>
        
        <div className="flex flex-col gap-6">
          ${aiBlock.trim()}
        </div>
      </div>
      <WeatherForecastModal isOpen={isWeatherModalOpen} onClose={() => setIsWeatherModalOpen(false)} inventory={inventory as any} />
      ${tail}`;

fs.writeFileSync(path, newContent);
console.log("Success");
