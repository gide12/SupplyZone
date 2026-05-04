const fs = require('fs');
const path = require('path');

let p = path.join(process.cwd(), 'src/components/SupplierDashboard.tsx');
let content = fs.readFileSync(p, 'utf8');

// Replace tab styles
content = content.replace(
  /className=\{`flex-1 py-3 text-sm font-bold game-text  border-r border-gray-100 transition-colors \$\{activeTab === 'market' \? 'bg-\[#00AA13\] text-white' : 'text-gray-400 hover:bg-gray-50'\}`\}/g,
  'className={`flex-1 py-4 text-sm font-bold game-text border-b-2 transition-colors ${activeTab === "market" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}'
);

content = content.replace(
  /className=\{`flex-1 py-3 text-sm font-bold game-text  border-r border-gray-100 transition-colors relative \$\{activeTab === 'orders' \? 'bg-\[#00AA13\] text-white' : 'text-gray-400 hover:bg-gray-50'\}`\}/g,
  'className={`flex-1 py-4 text-sm font-bold game-text border-b-2 transition-colors relative ${activeTab === "orders" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}'
);

content = content.replace(
  /className=\{`flex-1 py-3 text-sm font-bold game-text  border-r border-gray-100 transition-colors \$\{activeTab === 'inventory' \? 'bg-\[#00AA13\] text-white' : 'text-gray-400 hover:bg-gray-50'\}`\}/g,
  'className={`flex-1 py-4 text-sm font-bold game-text border-b-2 transition-colors ${activeTab === "inventory" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}'
);

content = content.replace(
  /className=\{`flex-1 py-3 text-sm font-bold game-text  transition-colors \$\{activeTab === 'profile' \? 'bg-\[#00AA13\] text-white' : 'text-gray-400 hover:bg-gray-50'\}`\}/g,
  'className={`flex-1 py-4 text-sm font-bold game-text border-b-2 transition-colors ${activeTab === "profile" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}'
);

fs.writeFileSync(p, content);

console.log("Updated Tabs");
