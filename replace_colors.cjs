const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src', 'components');

const replacements = [
  { regex: /bg-black\/[0-9]+/g, replace: 'bg-white' },
  { regex: /bg-black\b/g, replace: 'bg-white' },
  { regex: /border-white\/10/g, replace: 'border-gray-100' },
  { regex: /border-white\/20/g, replace: 'border-gray-200' },
  { regex: /text-white/g, replace: 'text-gray-900' },
  { regex: /text-gray-300/g, replace: 'text-gray-700' },
  { regex: /text-gray-400/g, replace: 'text-gray-500' },
  { regex: /text-gray-500/g, replace: 'text-gray-400' },
  { regex: /text-\[\#37B34A\]/g, replace: 'text-[#00AA13]' },
  { regex: /bg-\[\#37B34A\]/g, replace: 'bg-[#00AA13]' },
  { regex: /border-\[\#37B34A\]/g, replace: 'border-[#00AA13]' },
  { regex: /text-\[\#1A92D4\]/g, replace: 'text-[#EE2737]' },
  { regex: /bg-\[\#1A92D4\]/g, replace: 'bg-[#EE2737]' },
  { regex: /bg-[#1A92D4]\/[0-9]+/g, replace: 'bg-red-50' },
  { regex: /border-\[\#1A92D4\]/g, replace: 'border-[#EE2737]' },
  { regex: /bg-transparent/g, replace: 'bg-white' },
  { regex: /text-red-500/g, replace: 'text-[#EE2737]' },
  { regex: /text-red-400/g, replace: 'text-[#EE2737]' },
  { regex: /bg-red-500/g, replace: 'bg-[#EE2737]' },
  { regex: /border-red-500/g, replace: 'border-[#EE2737]' },
  // Remove uppercase stuff because GoFood is more sentence case
  { regex: /uppercase/g, replace: '' },
  { regex: /tracking-widest/g, replace: '' },
  { regex: /tracking-tight/g, replace: '' },
  { regex: /shadow-none/g, replace: 'shadow-sm' },
];

function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = path.join(currentDirPath, name);
        var stat = fs.statSync(filePath);
        if (stat.isFile() && filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            walkSync(filePath, callback);
        }
    });
}

// Also process App.tsx
const dirsToProcess = [componentsDir];
dirsToProcess.forEach(dir => {
  walkSync(dir, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacements.forEach(({regex, replace}) => {
      content = content.replace(regex, replace);
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  });
});

// Explicitly run for App.tsx too.
const appTsx = path.join(__dirname, 'src', 'App.tsx');
let appContent = fs.readFileSync(appTsx, 'utf8');
let originalApp = appContent;
replacements.forEach(({regex, replace}) => {
  appContent = appContent.replace(regex, replace);
});
if (appContent !== originalApp) {
  fs.writeFileSync(appTsx, appContent, 'utf8');
  console.log(`Updated: ${appTsx}`);
}
