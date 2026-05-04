const fs = require('fs');
const path = require('path');

let p = path.join(process.cwd(), 'src/components/RestaurantDashboard.tsx');
let content = fs.readFileSync(p, 'utf8');

// Replace tab styles
content = content.replace(
  /className=\{`flex-1 py-3 text-sm font-bold game-text  border-r border-gray-100 transition-colors \$\{activeTab === 'menu' \? 'bg-\[#00AA13\] text-white' : 'text-gray-400 hover:bg-gray-50'\}`\}/g,
  'className={`flex-1 py-4 text-sm font-bold game-text border-b-2 transition-colors ${activeTab === "menu" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}'
);

content = content.replace(
  /className=\{`flex-1 py-3 text-sm font-bold game-text  border-r border-gray-100 transition-colors \$\{activeTab === 'inventory' \? 'bg-\[#00AA13\] text-white' : 'text-gray-400 hover:bg-gray-50'\}`\}/g,
  'className={`flex-1 py-4 text-sm font-bold game-text border-b-2 transition-colors ${activeTab === "inventory" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}'
);

content = content.replace(
  /className=\{`flex-1 py-3 text-sm font-bold game-text  transition-colors \$\{activeTab === 'profile' \? 'bg-\[#00AA13\] text-white' : 'text-gray-400 hover:bg-gray-50'\}`\}/g,
  'className={`flex-1 py-4 text-sm font-bold game-text border-b-2 transition-colors ${activeTab === "profile" ? "border-[#00AA13] text-[#00AA13]" : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}'
);


// Form Save button
content = content.replace(
  /className="px-6 py-3 game-btn game-btn-green rounded-none text-xl game-text transition w-full"/g,
  'className="px-6 py-4 bg-[#00AA13] hover:bg-[#00AA13]/90 text-white font-bold rounded-xl text-xl game-text transition w-full"'
);


// Sidebar wrappers and gta-panel
content = content.replace(
  /bg-white game-panel text-center p-6 border-t-4 border-\[#00AA13\]/g,
  'bg-white text-center p-6 rounded-xl border border-gray-200 shadow-sm'
);

content = content.replace(
  /game-panel text-left p-6 max-w-2xl border-t-4 border-\[#00AA13\]/g,
  'bg-white text-left p-6 max-w-2xl rounded-xl border border-gray-200 shadow-sm'
);

fs.writeFileSync(p, content);

console.log("Updated RestaurantDashboard Tabs");
