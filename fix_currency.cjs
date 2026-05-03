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
      
      const original = content;

      // text outside variables
      content = content.replace(/>\$(?=\{)/g, '>Rp ');
      content = content.replace(/(?<=^|\s)\$(?=\{)/gm, 'Rp ');

      // template literals
      content = content.replace(/\$\$\{/g, 'Rp ${');
      
      // string literals
      content = content.replace(/at \$/g, 'at Rp ');
      content = content.replace(/Locked at \$/g, 'Locked at Rp ');
      content = content.replace(/\$([0-9]+)/g, 'Rp $1');
      
      // JSX hardcoded elements
      content = content.replace(/>\$/g, '>Rp ');
      
      content = content.replace(/Est\. Revenue \(\$\)/g, 'Est. Revenue (Rp)');

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir(path.join(process.cwd(), 'src'));
