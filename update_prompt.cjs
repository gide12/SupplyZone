const fs = require('fs');
const path = require('path');

let p = path.join(process.cwd(), 'src/components/WeatherForecastModal.tsx');
let content = fs.readFileSync(p, 'utf8');

const targetPrompt = `Predict how the current forecasted weather (\${weatherCondition}) in \${location} will affect the harvest, supply, and future prices for these ingredients. 
Output an array of objects for each ingredient discussing the weather condition, harvest impact, price change forecast, and business recommendation.`;

const replacePrompt = `Predict how the current forecasted weather (\${weatherCondition}) in \${location} will affect the harvest, supply, and future prices for these ingredients. 
Please provide the response in Indonesian (Bahasa Indonesia). Output an array of objects for each ingredient discussing the weather condition, harvest impact, price change forecast, and business recommendation.`;

content = content.replace(targetPrompt, replacePrompt);

fs.writeFileSync(p, content);
console.log("Updated prompt to Indonesian");
