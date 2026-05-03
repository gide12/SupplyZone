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
      
      // Revert completely!
      // Rp { -> ${
      content = content.replace(/Rp \{/g, '${');
      // Rp  Rp { -> Rp {
      content = content.replace(/Rp Rp \{/g, 'Rp {');

      // Now `Rp {` should be completely gone. We are at `${` state but with `Rp` in front of `{`.
      // Actually some might be left. Let's do it safely.
      content = content.replace(/Rp /g, ''); // Removes ALL "Rp ". Including the good ones, we'll re-apply them!
      
      // Let's re-apply currency to formatting: 
      // 1. `\${` in JSX string should be `Rp {` when we actually want to show currency.
      // But wait! If I just remove "Rp ", I might destroy legitimate "Rp " if it existed before. (There shouldn't be).
      // Wait, there's `Est. (Rp)`
      content = content.replace(/Est\. Revenue \(Rp\)/g, 'Est. Revenue ($)');

      // NOW we are back to square one before ALL this "Rp" mess. Let's make sure.
      
      // Manual replacements
      
      // MenuManager.tsx
      content = content.replace(/text-xl">\$<\/span>/g, 'text-xl">Rp </span>');
      content = content.replace(/\$\{item\.price\.toFixed\(2\)\}/g, 'Rp ${item.price.toFixed(2)}');
      content = content.replace(/\$\{dynamicInfo\.estimatedPrice\.toFixed\(2\)\}/g, 'Rp ${dynamicInfo.estimatedPrice.toFixed(2)}');
      content = content.replace(/\$\{deal\.proposedPrice\.toFixed\(2\)\}/g, 'Rp ${deal.proposedPrice.toFixed(2)}');
      
      // ChatModal.tsx - nothing to replace

      // PredictSupplyModal.tsx - nothing to replace

      // RestaurantDashboard.tsx
      content = content.replace(/at \$\$\{lowestSupplier/g, 'at Rp ${lowestSupplier');
      
      // AIMarginPredictor.tsx
      content = content.replace(/Est\. Revenue \(\$\)/g, 'Est. Revenue (Rp)');
      content = content.replace(/\$\$\{productRevenue\}/g, 'Rp ${productRevenue}');
      content = content.replace(/Locked at \$\$\{ing/g, 'Locked at Rp ${ing');
      content = content.replace(/\$\{prediction\.recommendedSellingPrice\.toFixed\(2\)\}/g, 'Rp ${prediction.recommendedSellingPrice.toFixed(2)}');
      content = content.replace(/\$\{comp\.maxPrice\.toFixed\(2\)\}/g, 'Rp ${comp.maxPrice.toFixed(2)}');
      content = content.replace(/\$\{\(prediction\.recommendedSellingPrice - prediction\.totalAllowedCost\)\.toFixed\(2\)\}/g, 'Rp ${(prediction.recommendedSellingPrice - prediction.totalAllowedCost).toFixed(2)}');
      
      // SupplierInventory.tsx
      content = content.replace(/Base: \$\{item\.basePrice/g, 'Base: Rp ${item.basePrice');
      content = content.replace(/Est\. Market Price: \$\{dynamicInfo/g, 'Est. Market Price: Rp ${dynamicInfo');
      
      // SupplierDashboard.tsx
      content = content.replace(/\$\{item\.basePrice\.toFixed\(2\)\}/g, 'Rp ${item.basePrice.toFixed(2)}');
      content = content.replace(/mr-2 game-text">\$<\/span>/g, 'mr-2 game-text">Rp </span>');
      // deal.proposedPrice is already covered? In SupplierDashboard it's just `${deal.proposedPrice.toFixed(2)}`
      content = content.replace(/\$\{deal\.proposedPrice\.toFixed\(2\)\}/g, 'Rp ${deal.proposedPrice.toFixed(2)}');

      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(path.join(process.cwd(), 'src'));
