const fs = require('fs');
const path = require('path');

const typesPath = path.join(process.cwd(), 'src/types.ts');
let content = fs.readFileSync(typesPath, 'utf8');

content = content.replace(
  'quantity: number;',
  'quantity: number;\n  unit?: string;'
);

content = content.replace(
  'quantity: number;\n  basePrice: number;',
  'quantity: number;\n  unit?: string;\n  basePrice: number;'
);

fs.writeFileSync(typesPath, content);
console.log("Updated types.ts");
