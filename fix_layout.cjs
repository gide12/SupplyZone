const fs = require('fs');

const path = 'src/components/SupplierInventory.tsx';
let content = fs.readFileSync(path, 'utf8');

// The file right now has:
// 1. Tambah Barang
// 2. Right before "Smart AI Storage Warning" there is `</div>\n        </div>\n\n        <div className="flex flex-col gap-6">`
// 3. Right after "Analisa AI" there is `</div>\n          </div>\n\n          <div className="space-y-3">`
// 4. At the bottom there is random garbage: `</div>\n        </div>\n        \n        <div className="flex flex-col gap-6">\n          <div className="bg-white border border-gray-200 p-6 relative shadow-sm">\n            <h3 className="font-bold text-[#EE2737] text-xl game-title flex items-center gap-2 mb-2">\n               <BrainCircuit className="w-5 h-5" /> Smart AI Storage Warning\n      <EstimateExpirationModal `

// Let's rewrite it based on extracting the blocks
// Extract "Tambah Barang" (from start down to just before the AI Warning)
const part1_start = content.indexOf('      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">');
const block1_end = content.indexOf('        <div className="flex flex-col gap-6">\\n          <div className="bg-white border border-gray-200 p-6 relative shadow-sm">\\n            <h3 className="font-bold text-[#EE2737] text-xl game-title flex items-center gap-2 mb-2">\\n               <BrainCircuit className="w-5 h-5" /> Smart AI Storage Warning', part1_start);

// Extract "Stok Saat Ini"
const stok_saat_ini_idx = content.indexOf('<div className="space-y-3">\\n            <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-1">\\n              <h3 className="text-sm font-bold text-[#00AA13]  tracking-wide game-text">Stok Saat Ini</h3>');

// Extract AI Warning and Analisa AI
// From block1_end to stok_saat_ini_idx
const ai_blocks = content.substring(content.indexOf('<div className="bg-white border border-gray-200 p-6 relative shadow-sm">', part1_start), stok_saat_ini_idx);

// Extract from Stok Saat ini down to the stray junk
const end_stray = content.indexOf('        <div className="flex flex-col gap-6">\\n          <div className="bg-white border border-gray-200 p-6 relative shadow-sm">\\n            <h3 className="font-bold text-[#EE2737] text-xl game-title flex items-center gap-2 mb-2">\\n               <BrainCircuit className="w-5 h-5" /> Smart AI Storage Warning\\n      <EstimateExpirationModal ');

const stok_block = content.substring(stok_saat_ini_idx, end_stray);

// Reassemble
const head = content.substring(0, content.indexOf('        </div>\\n\\n        <div className="flex flex-col gap-6">\\n          <div className="bg-white border border-gray-200 p-6 relative shadow-sm">\\n            <h3 className="font-bold text-[#EE2737] text-xl game-title flex items-center gap-2 mb-2">\\n               <BrainCircuit className="w-5 h-5" /> Smart AI Storage Warning'));

const new_content = head + `
          ${stok_block.trim()}
        </div>

        <div className="flex flex-col gap-6">
          ${ai_blocks.trim()}
        </div>
      </div>
      <EstimateExpirationModal ` + content.substring(content.indexOf('isOpen={isExpModalOpen}', end_stray));

fs.writeFileSync(path, new_content);
console.log('Fixed layout successfully!');
