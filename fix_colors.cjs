const fs = require('fs');
let code = fs.readFileSync('src/components/SupplierInventory.tsx', 'utf8');
code = code.replace(/focus:border-\[\#00AA13\]/g, 'focus:border-[#EE2737]');
fs.writeFileSync('src/components/SupplierInventory.tsx', code);
console.log('Fixed border colors');
