const fs = require('fs');
const path = require('path');

// 1. Supplier Dashboard (Deals from Restaurants)
let supPath = path.join(process.cwd(), 'src/components/SupplierDashboard.tsx');
let supContent = fs.readFileSync(supPath, 'utf8');
supContent = supContent.replace(
  '<div className="text-sm font-bold text-[#EE2737] game-text  mt-1">{restaurant?.name}</div>',
  '<div className="text-sm font-bold text-[#EE2737] game-text  mt-1">{restaurant?.name}</div>\n                    {restaurant?.address && <div className="text-xs text-gray-500 font-bold mt-0.5">{restaurant.address}</div>}'
);
fs.writeFileSync(supPath, supContent);

// 2. MenuManager (Deals from Suppliers)
let menuPath = path.join(process.cwd(), 'src/components/MenuManager.tsx');
let menuContent = fs.readFileSync(menuPath, 'utf8');

menuContent = menuContent.replace(
  'const supplierName = suppliers.find(s => s.id === deal.supplierId)?.name || "Unknown Supplier";',
  'const supplier = suppliers.find(s => s.id === deal.supplierId);\n                                const supplierName = supplier?.name || "Unknown Supplier";'
);
menuContent = menuContent.replace(
  '<span className="font-bold text-lg text-gray-900 truncate mr-2 game-text" title={supplierName}>{supplierName}</span>',
  '<span className="font-bold text-lg text-gray-900 truncate mr-2 game-text" title={supplierName}>{supplierName}</span>\n                                      {supplier?.address && <div className="text-xs text-gray-500 font-bold absolute top-10 left-3 truncate w-40">{supplier.address}</div>}'
);
// Adjust layout to prevent overlap 
menuContent = menuContent.replace(
  '<div className="flex items-center justify-between">',
  '<div className="flex items-start justify-between pb-2">'
);

fs.writeFileSync(menuPath, menuContent);

console.log("Matchmaking addresses updated");
