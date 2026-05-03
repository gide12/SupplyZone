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
      
      // Fix our horrible mistake
      content = content.replace(/Rp \{/g, '${');
      content = content.replace(/ \$/g, ' Rp ');

      // Fix double $ -> Rp
      content = content.replace(/\$Rp /g, 'Rp ');
      
      content = content.replace(/Est. Revenue \(\$\)/g, 'Est. Revenue (Rp)');

      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(path.join(process.cwd(), 'src'));
