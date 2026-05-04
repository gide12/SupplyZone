const fs = require('fs');
const path = require('path');

let p = path.join(process.cwd(), 'src/components/MenuManager.tsx');
let content = fs.readFileSync(p, 'utf8');

content = content.replace(/hover:bg-white\/10/g, 'hover:bg-gray-50');
content = content.replace(/rounded-none/g, '');

content = content.replace(
  /className="p-3 text-gray-900 border border-gray-200 bg-white hover:bg-gray-50 transition-all"/g,
  'className="p-3 rounded-lg text-gray-900 border border-gray-200 bg-white hover:bg-gray-50 transition-all"'
);
content = content.replace(
  /className="px-6 py-2 text-lg font-bold text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors game-text bg-white"/g,
  'className="px-6 py-2 text-lg font-bold text-gray-900 border border-gray-200 hover:bg-gray-50 transition-colors game-text bg-white rounded-xl"'
);
content = content.replace(
  /className="px-6 py-2 game-btn game-btn-red text-lg font-bold transition-all"/g,
  'className="px-6 py-2 game-btn game-btn-red text-white text-lg font-bold transition-all rounded-xl hover:opacity-90"'
);


fs.writeFileSync(p, content);
console.log("Updated MenuManager");
