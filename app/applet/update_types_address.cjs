const fs = require('fs');
const path = require('path');

const typesPath = path.join(process.cwd(), 'src/types.ts');
let content = fs.readFileSync(typesPath, 'utf8');

content = content.replace(/lat: number;\n  lng: number;/g, 'address: string;');
fs.writeFileSync(typesPath, content);
console.log("Updated types.ts");
