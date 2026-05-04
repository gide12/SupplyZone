const fs = require('fs');
const path = require('path');

const units = ["kg", "Liter", "Drum", "Karton", "Karung", "Pallet", "Biji"];
const unitSelectOptions = units.map(u => `<option value="${u}">${u}</option>`).join('');
const unitSelectHTML = `                <div>
                   <label className="block text-xs font-bold text-gray-400 mb-1 game-text">Unit</label>
                   <select className="w-full bg-white border border-gray-200 text-gray-900 p-2 game-text focus:outline-none focus:border-[#00AA13]" value={newUnit} onChange={e => setNewUnit(e.target.value)} required>
                     <option value="">Select</option>
                     ${unitSelectOptions}
                   </select>
                </div>`;

const filePath = path.join(process.cwd(), 'src/components/RestaurantInventory.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  '<div className="grid grid-cols-2 gap-3">',
  '<div className="grid grid-cols-3 gap-3">'
);

content = content.replace(
  '<div>\n                  <label className="block text-xs  font-bold text-gray-400 mb-1 game-text">Space Used (sq ft)</label>',
  unitSelectHTML + '\n                <div>\n                  <label className="block text-xs  font-bold text-gray-400 mb-1 game-text">Space Used (sq ft)</label>'
);

fs.writeFileSync(filePath, content);
console.log("Fixed Restaurant");
