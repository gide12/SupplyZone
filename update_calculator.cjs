const fs = require('fs');
const path = require('path');

const p = path.join(process.cwd(), 'src/components/SupplierCalculator.tsx');
let content = fs.readFileSync(p, 'utf8');

// add import
content = content.replace(
  /import \{ Calculator \} from "lucide-react";/,
  'import { Calculator } from "lucide-react";\nimport { useAppContext } from "../store/AppContext";'
);

// get inventory
content = content.replace(
  /export function SupplierCalculator\(\) \{/,
  'export function SupplierCalculator() {\n  const { activeSupplier } = useAppContext();\n  const inventory = activeSupplier.inventory || [];\n  const [selectedItemName, setSelectedItemName] = useState("");'
);

// handleItemSelect
const newHandler = `
  const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedItemName(val);
    if (val) {
      const item = inventory.find(i => i.name === val);
      if (item) {
        setMarginHpp(item.basePrice);
        setLossTotal(item.quantity);
        setBepVarCost(item.basePrice);
      }
    } else {
      setMarginHpp("");
      setLossTotal("");
      setBepVarCost("");
    }
  };
`;
content = content.replace(
  /const hitungHPP = \(\) => \{/,
  newHandler + '\n  const hitungHPP = () => {'
);

const selectUI = `
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 max-w-sm">
        <label className="block text-sm text-gray-600 mb-2 font-bold game-text">Pilih Barang (Inventory)</label>
        <select 
          value={selectedItemName} 
          onChange={handleItemSelect}
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text"
        >
          <option value="">Isi Manual (Tidak pilih barang)</option>
          {inventory.map(item => (
            <option key={item.id} value={item.name}>{item.name}</option>
          ))}
        </select>
      </div>
`;

content = content.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 gap-6">/,
  selectUI + '\n      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">'
);

fs.writeFileSync(p, content);
console.log("Updated calculator with item selection");
