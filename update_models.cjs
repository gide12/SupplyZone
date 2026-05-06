const fs = require('fs');
const path = require('path');

function replaceModel(filePath) {
  const fullPath = path.join(__dirname, filePath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(/gemini-[0-9\.]+[a-z-]*/g, 'gemini-2.5-flash');
  
  fs.writeFileSync(fullPath, content, 'utf8');
}

const files = [
  'src/components/PredictSupplyModal.tsx',
  'src/components/RestaurantInventory.tsx',
  'src/components/WeatherForecastModal.tsx',
  'src/components/FuelEstimateCard.tsx',
  'src/components/AIMarginPredictor.tsx',
  'src/components/SupplierInventory.tsx',
  'src/components/EstimateExpirationModal.tsx'
];

files.forEach(replaceModel);
console.log('Models updated');
