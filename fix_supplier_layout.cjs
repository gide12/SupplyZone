const fs = require('fs');

const path = 'src/components/SupplierInventory.tsx';
let content = fs.readFileSync(path, 'utf8');

// I'll grab all the main pieces
const addFormStart = content.indexOf('<div className="game-panel-inner p-4 hover:border-gray-200 transition-colors">');
const autoImportEnd = content.indexOf('<span className="text-[10px]">Unggah CSV/Excel</span>\n              </button>\n            </div>\n          </div>') + 116;

const addFormBlock = content.substring(addFormStart, autoImportEnd);

const stokStart = content.indexOf('<div className="space-y-3">\n            <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-1">\n              <h3 className="text-sm font-bold text-[#00AA13]  tracking-wide game-text">');
const stokEnd = content.indexOf('</div>\n        </div>\n        \n        <div className="flex flex-col gap-6">');

// It's probably easier to just find the elements and replace the whole return block

const beforeReturn = content.substring(0, content.indexOf('return (') + 'return ('.length);

const aiStorageWarningsEndIdx = content.indexOf('<h3 className="font-bold text-transparent bg-clip-text');
const aiStorageWarningsStartIdx = content.substring(0, aiStorageWarningsEndIdx).lastIndexOf('<div className="bg-white border border-gray-200 p-6 relative shadow-sm">');
const aiStorageBlock = content.substring(aiStorageWarningsStartIdx, content.indexOf('</div>\n\n          <div className="bg-white border border-gray-200 p-6 relative shadow-sm">'));


console.log("Found add form of length", addFormBlock.length);
console.log("Found ai storage block of length", aiStorageBlock.length);

