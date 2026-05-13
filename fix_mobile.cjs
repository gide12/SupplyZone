const fs = require('fs');
let restDash = fs.readFileSync('src/components/RestaurantDashboard.tsx', 'utf8');

restDash = restDash.replace(
  'min-h-[calc(100vh-10rem)]',
  'min-h-fit md:min-h-[calc(100vh-10rem)]'
);

restDash = restDash.replace(
  '<aside className="w-full md:w-64 flex-shrink-0 flex flex-col',
  '<aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4'
);

// We should also make the nav mobile friendly
restDash = restDash.replace(
  'flex items-center gap-3',
  'flex items-center gap-2 md:gap-3'
);

restDash = restDash.replace(
  'px-6 py-4 flex items-center justify-between',
  'px-3 md:px-6 py-3 md:py-4 flex items-center justify-between'
);

// Make tabs horizontal on mobile?
restDash = restDash.replace(
  '<div className="space-y-4">',
  '<div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">'
);
restDash = restDash.replace(
  /w-full flex items-center gap-3 px-4 py-3 rounded/g,
  'w-full flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded whitespace-nowrap'
);


fs.writeFileSync('src/components/RestaurantDashboard.tsx', restDash);
console.log('Fixed RestaurantDashboard.tsx');


let suppDash = fs.readFileSync('src/components/SupplierDashboard.tsx', 'utf8');

suppDash = suppDash.replace(
  'className="flex h-screen bg-white flex-col md:flex-row overflow-hidden relative"',
  'className="flex h-screen bg-white flex-col-reverse md:flex-row overflow-hidden relative"'
);

suppDash = suppDash.replace(
  '<div className="w-full md:w-96 bg-white flex flex-col h-full z-10 border-r border-gray-200 shrink-0 relative">',
  '<div className="w-full md:w-96 bg-white flex flex-col h-[50vh] md:h-full z-10 border-t md:border-r border-gray-200 shrink-0 relative">'
);

suppDash = suppDash.replace(
  '<div className="flex-1 relative z-0 h-full min-h-[50vh]">',
  '<div className="flex-1 relative z-0 h-[50vh] md:h-full">'
);

fs.writeFileSync('src/components/SupplierDashboard.tsx', suppDash);
console.log('Fixed SupplierDashboard.tsx');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
appTsx = appTsx.replace(
  'className="fixed bottom-6 right-6 z-[9999] game-panel p-2 flex gap-2"',
  'className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] game-panel p-2 flex gap-2 sm:scale-100 scale-90 origin-bottom-right"'
);
fs.writeFileSync('src/App.tsx', appTsx);
console.log('Fixed App.tsx');

