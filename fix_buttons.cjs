const fs = require('fs');
const path = require('path');

let p = path.join(process.cwd(), 'src/components/SupplierDashboard.tsx');
let content = fs.readFileSync(p, 'utf8');

// Fix badge text colors
content = content.replace(/text-gray-900 text-\[10px\]/g, 'text-white text-[10px]');

// Fix buttons that have rounded-none or are overly basic
content = content.replace(
  /button\s+onClick=\{handleProposeDeal\}\s+className="flex-1 game-btn game-btn-green py-2 text-lg font-bold transition-all text-gray-900/g,
  'button onClick={handleProposeDeal} className="flex-1 game-btn game-btn-green py-2 text-lg font-bold transition-all text-white'
);

content = content.replace(
  /button\s+onClick=\{handleProposeDeal\}\s+className="flex-1 game-btn game-btn-green py-2 text-lg font-bold transition-all text-white game-text px-4"/g,
  'button \n                        onClick={handleProposeDeal}\n                        className="flex-1 game-btn game-btn-green py-2 text-lg font-bold transition-all text-white game-text px-4 rounded-xl"'
);

content = content.replace(
  /px-4 py-2 border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 game-text transition-colors text-lg/g,
  'px-4 py-2 border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 game-text transition-colors text-lg rounded-xl'
);

content = content.replace(
  /mt-3 w-full py-3 border border-gray-200 bg-white text-white hover:bg-\[#00AA13\] hover:border-\[#00AA13\] hover:text-white text-lg font-bold game-text transition-colors/g,
  'mt-3 w-full py-3 border border-[#00AA13] bg-white text-[#00AA13] hover:bg-[#00AA13] hover:text-white text-lg font-bold game-text transition-all rounded-xl'
);

content = content.replace(
  /bg-\[--color-gta-red\]/g,
  'bg-[#EE2737]'
);
content = content.replace(
  /border-\[--color-gta-red\]/g,
  'border-[#EE2737]'
);

content = content.replace(
  /bg-white border text-\[#EE2737\] hover:bg-\[#EE2737\] hover:text-white text-sm font-bold transition-colors/g,
  'bg-white border rounded-lg text-[#EE2737] hover:bg-[#EE2737] hover:text-white text-sm font-bold transition-colors'
);

content = content.replace(
  /bg-white border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-sm font-bold transition-colors/g,
  'bg-white border rounded-lg border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-sm font-bold transition-colors'
);

content = content.replace(
  /bg-white border border-\[#F1B51A\] text-\[#F1B51A\] hover:bg-\[#F1B51A\] hover:text-black text-sm font-bold transition-colors/g,
  'bg-white border rounded-lg border-[#F1B51A] text-[#F1B51A] hover:bg-[#F1B51A] hover:text-black text-sm font-bold transition-colors'
);

content = content.replace(
  /bg-white border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-gray-900 text-sm font-bold transition-colors/g,
  'bg-white border rounded-lg border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white text-sm font-bold transition-colors'
);

content = content.replace(
  /p-2 text-white bg-\[#EE2737\] hover:bg-\[#EE2737\] rounded-none transition-colors active:scale-95 border border-\[#EE2737\]/g,
  'p-2 text-white bg-[#EE2737] hover:bg-[#EE2737]/90 rounded-xl transition-colors active:scale-95 border border-[#EE2737]'
);

// Form Save button
content = content.replace(
  /w-full py-3 game-btn game-btn-green font-bold transition-all text-xl game-text  text-gray-900/g,
  'w-full py-3 bg-[#00AA13] hover:bg-[#00AA13]/90 font-bold transition-all text-xl game-text text-white rounded-xl'
);
content = content.replace(
  /text-gray-900  rounded-none/g,
  'text-white rounded-xl'
);


fs.writeFileSync(p, content);

console.log("Updated Button Styles");
