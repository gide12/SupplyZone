const fs = require('fs');
const path = require('path');

let p = path.join(process.cwd(), 'src/components/SupplierDashboard.tsx');
let content = fs.readFileSync(p, 'utf8');

// Replace hover:bg-white/10
content = content.replace(/hover:bg-white\/10/g, 'hover:bg-gray-50');

// Replace rounded-none
content = content.replace(/rounded-none/g, '');

// Replace GTA classes
content = content.replace(/bg-\[--color-gta-panel\]/g, 'bg-white');
content = content.replace(/bg-\[--color-gta-red\]/g, 'bg-[#EE2737]');
content = content.replace(/border-\[--color-gta-red\]/g, 'border-[#EE2737]');
content = content.replace(/gta-header/g, '');

// Tab bar flex wrapper: flex border-b border-gray-100 bg-white
content = content.replace(
  /<div className="flex items-center gap-3">/g,
  '<div className="flex items-center gap-3 p-2">'
);

// Add rounded to the tab buttons to make them look nice maybe? 
// No, the tabs are in a flex container, so they are flat tabs. That's fine.

// Let's also check RestaurantDashboard.tsx
let r = path.join(process.cwd(), 'src/components/RestaurantDashboard.tsx');
let rContent = fs.readFileSync(r, 'utf8');
rContent = rContent.replace(/rounded-none/g, '');
rContent = rContent.replace(/hover:bg-white\/10/g, 'hover:bg-gray-50');
rContent = rContent.replace(/bg-\[--color-gta-panel\]/g, 'bg-white');
rContent = rContent.replace(/bg-\[--color-gta-red\]/g, 'bg-[#EE2737]');
rContent = rContent.replace(/border-\[--color-gta-red\]/g, 'border-[#EE2737]');
rContent = rContent.replace(/gta-header/g, '');
fs.writeFileSync(r, rContent);

fs.writeFileSync(p, content);

console.log("Updated both dashboards");
