const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/Rp Rp \$\{/g, 'Rp ${');
      content = content.replace(/at \$\$\{lowestSupplier/g, 'at Rp ${lowestSupplier'); // Wait, earlier I might have failed this.
      content = content.replace(/at Rp Rp \$\{lowestSupplier/g, 'at Rp ${lowestSupplier');
      content = content.replace(/Est\. Revenue \(\$\)/g, 'Est. Revenue (Rp)');
      content = content.replace(/>\$(?=<)/g, '>Rp<');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(path.join(process.cwd(), 'src'));
