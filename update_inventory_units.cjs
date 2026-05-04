const fs = require('fs');
const path = require('path');

const units = ["kg", "Liter", "Drum", "Karton", "Karung", "Pallet", "Biji"];
const unitSelectOptions = units.map(u => `<option value="${u}">${u}</option>`).join('');
const unitSelectHTML = `<select className="px-3 py-2 bg-white border border-gray-200 focus:outline-none focus:border-[#00AA13] game-text font-bold" value={newUnit} onChange={e => setNewUnit(e.target.value)}>
                      <option value="">Unit</option>
                      ${unitSelectOptions}
                    </select>`;

function updateComponent(filePath, isSupplier) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add newUnit state
  content = content.replace(
    'const [newQuantity, setNewQuantity] = useState("");',
    'const [newQuantity, setNewQuantity] = useState("");\n  const [newUnit, setNewUnit] = useState("");'
  );

  // Add parameter to addItem
  content = content.replace(
    'quantity: Number(newQuantity),',
    'quantity: Number(newQuantity),\n      unit: newUnit,'
  );

  // Clear newUnit on Add
  content = content.replace(
    'setNewQuantity("");',
    'setNewQuantity("");\n    setNewUnit("");'
  );

  // Update input row
  content = content.replace(
    '<input\n                      type="number"',
    unitSelectHTML + '\n                    <input\n                      type="number"'
  );

  // Display unit
  content = content.replace(
    '<span>Qty: {item.quantity}</span>',
    '<span>Qty: {item.quantity} {item.unit || ""}</span>'
  );

  // AI prompt update
  content = content.replace(
    'quantity (number)',
    'quantity (number), unit (string: one of kg, Liter, Drum, Karton, Karung, Pallet, Biji)'
  );
  
  content = content.replace(
    'quantity: { type: Type.NUMBER },',
    'quantity: { type: Type.NUMBER },\n                unit: { type: Type.STRING },'
  );

  content = content.replace(
    'required: ["name", "quantity"',
    'required: ["name", "quantity", "unit"'
  );

  content = content.replace(
    'quantity: item.quantity,',
    'quantity: item.quantity,\n          unit: item.unit,'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${path.basename(filePath)}`);
}

updateComponent(path.join(process.cwd(), 'src/components/RestaurantInventory.tsx'), false);
updateComponent(path.join(process.cwd(), 'src/components/SupplierInventory.tsx'), true);
