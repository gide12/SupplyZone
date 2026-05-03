const fs = require('fs');
const path = require('path');

const componentsDir = path.join(process.cwd(), 'src', 'components');
const appTsx = path.join(process.cwd(), 'src', 'App.tsx');

function fixContent(content) {
  content = content.replace(/bg-\[\#EE2737\](.*?)text-gray-\d\d\d/g, 'bg-[#EE2737]$1text-white');
  content = content.replace(/bg-\[\#00AA13\](.*?)text-gray-\d\d\d/g, 'bg-[#00AA13]$1text-white');
  content = content.replace(/text-gray-\d\d\d(.*?)bg-\[\#EE2737\]/g, 'text-white$1bg-[#EE2737]');
  content = content.replace(/text-gray-\d\d\d(.*?)bg-\[\#00AA13\]/g, 'text-white$1bg-[#00AA13]');
  
  content = content.replace(/bg-\[--color-gta-red\](.*?)text-gray-\d\d\d/g, 'bg-[#EE2737]$1text-white');
  content = content.replace(/bg-\[\#EE2737\](.*?)text-black/g, 'bg-[#EE2737]$1text-white');
  content = content.replace(/bg-\[\#00AA13\](.*?)text-black/g, 'bg-[#00AA13]$1text-white');
  
  return content;
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const newContent = fixContent(content);
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

if (fs.existsSync(componentsDir)) {
  processDir(componentsDir);  
}

if (fs.existsSync(appTsx)) {
  const content = fs.readFileSync(appTsx, 'utf8');
  const newContent = fixContent(content);
  if (content !== newContent) {
    fs.writeFileSync(appTsx, newContent);
  }
}
