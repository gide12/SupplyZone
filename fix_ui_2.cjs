const fs = require('fs');
const path = require('path');

let p = path.join(process.cwd(), 'src/components/SupplierDashboard.tsx');
let content = fs.readFileSync(p, 'utf8');

// Truck icon bg
content = content.replace(
  /<div className="w-12 h-12 bg-\[#00AA13\] border border-gray-200 flex items-center justify-center shadow-sm">/g,
  '<div className="w-12 h-12 bg-[#00AA13] rounded-xl flex items-center justify-center shadow-sm">'
);

// Supplier Portal Tag
content = content.replace(
  /<span className="px-3 py-1 bg-\[#EE2737\] border border-\[#EE2737\] text-white text-xs font-bold  game-text shadow-sm">/g,
  '<span className="px-3 py-1 bg-[#EE2737] text-white text-xs font-bold rounded-full game-text shadow-sm">'
);

// Sidebar wrapper
content = content.replace(
  /w-full md:w-96 game-panel  flex flex-col h-full z-10 border-0 border-r border-gray-100 shrink-0 relative/g,
  'w-full md:w-96 bg-white flex flex-col h-full z-10 border-r border-gray-200 shrink-0 relative'
);

// Dapurku text shadow
content = content.replace(
  /drop-shadow-sm/g,
  ''
);

// Profile textareas / inputs
content = content.replace(
  /w-full p-3  focus:outline-none game-text text-xl/g,
  'w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text text-lg'
);
content = content.replace(
  /w-full p-3 bg-white border border-gray-200  focus:outline-none focus:border-\[#00AA13\] game-text text-lg/g,
  'w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text text-lg'
);
content = content.replace(
  /w-full p-2.5 bg-white border border-gray-200  focus:outline-none focus:border-\[#00AA13\] game-text text-xl/g,
  'w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text text-lg'
);
content = content.replace(
  /w-full p-2.5  focus:outline-none game-text text-xl/g,
  'w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text text-lg'
);
content = content.replace(
  /w-full p-2.5  focus:outline-none game-text text-xl border border-gray-200/g,
  'w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text text-lg'
);


fs.writeFileSync(p, content);

let r = path.join(process.cwd(), 'src/components/RestaurantDashboard.tsx');
let rContent = fs.readFileSync(r, 'utf8');

rContent = rContent.replace(
  /<div className="w-10 h-10 bg-white hover:bg-white  flex items-center justify-center border border-gray-200 transition-colors relative">/g,
  '<div className="w-10 h-10 bg-white hover:bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 transition-colors relative cursor-pointer">'
);

rContent = rContent.replace(
  /<span className="ml-2 px-2 py-0.5 bg-\[#00AA13\] text-white border border-\[#00AA13\] text-xs   tracking-wider game-text shadow-sm">/g,
  '<span className="ml-2 px-3 py-1 bg-[#00AA13] text-white text-xs font-bold rounded-full game-text shadow-sm">'
);

rContent = rContent.replace(
  /w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-\[#00AA13\] focus:ring-1 focus:ring-\[#00AA13\] outline-none transition-all game-text text-lg/g,
  'w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text text-lg'
);

rContent = rContent.replace(
  /w-full p-2.5  focus:outline-none game-text text-xl/g,
  'w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text text-lg'
);

rContent = rContent.replace(
  /w-full p-2.5  focus:outline-none game-text text-xl border border-gray-200/g,
  'w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text text-lg'
);


fs.writeFileSync(r, rContent);

console.log("Improved styling more");
