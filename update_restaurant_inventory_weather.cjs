const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/components/RestaurantInventory.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Imports
content = content.replace(
  'import { useAppContext } from "../store/AppContext";',
  'import { useAppContext } from "../store/AppContext";\nimport { WeatherForecastModal } from "./WeatherForecastModal";\nimport { CloudRain } from "lucide-react";'
);

// State
content = content.replace(
  'const [isImportModalOpen, setIsImportModalOpen] = useState(false);',
  'const [isImportModalOpen, setIsImportModalOpen] = useState(false);\n  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);'
);

// Button UI
const weatherButton = `
            <button 
              onClick={() => setIsWeatherModalOpen(true)}
              disabled={inventory.length === 0}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white font-bold game-text text-lg flex items-center justify-center gap-2 transition-colors border border-blue-600 mb-6"
            >
              <CloudRain className="w-5 h-5" />
              Cek Harga & Forecast
            </button>
`;

content = content.replace(
  '{loading ? "Analyzing Matrix..." : "Calculate Efficiency & Capacity"}\n            </button>',
  '{loading ? "Analyzing Matrix..." : "Calculate Efficiency & Capacity"}\n            </button>\n' + weatherButton
);

// Modal UI at end of return block
content = content.replace(
  '</div>\n    </div>\n  );\n}',
  '</div>\n      <WeatherForecastModal isOpen={isWeatherModalOpen} onClose={() => setIsWeatherModalOpen(false)} inventory={inventory} />\n    </div>\n  );\n}'
);

fs.writeFileSync(filePath, content);
console.log("Updated RestaurantInventory.tsx");
