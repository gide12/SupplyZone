const fs = require('fs');
const path = require('path');

let supPath = path.join(process.cwd(), 'src/components/SupplierDashboard.tsx');
let supContent = fs.readFileSync(supPath, 'utf8');

supContent = supContent.replace(
  '<h3 className="font-bold text-gray-900 text-2xl game-text group-hover:text-[#00AA13]">{restaurant.name}</h3>',
  '<h3 className="font-bold text-gray-900 text-2xl game-text group-hover:text-[#00AA13]">{restaurant.name}</h3>\n            {restaurant.address && <p className="text-xs text-gray-500 font-bold mt-1 game-text truncate">{restaurant.address}</p>}'
);

supContent = supContent.replace(
  '<h2 className="text-2xl font-bold text-[#00AA13] truncate game-text">{selectedRestaurant?.name}</h2>',
  '<div>\n          <h2 className="text-2xl font-bold text-[#00AA13] truncate game-text">{selectedRestaurant?.name}</h2>\n          {selectedRestaurant?.address && <p className="text-[10px] text-gray-500 font-bold game-text truncate w-48">{selectedRestaurant.address}</p>}\n        </div>'
);

fs.writeFileSync(supPath, supContent);
console.log("Updated market details matching address");
